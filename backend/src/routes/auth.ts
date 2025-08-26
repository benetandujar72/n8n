import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { createActivityLog } from '../utils/activityLogger';

const router = Router();

// Middleware de validació
const validateLogin = [
  body('email').isEmail().withMessage('Email invàlid'),
  body('password').isLength({ min: 6 }).withMessage('La contrasenya ha de tenir almenys 6 caràcters'),
];

const validateRegister = [
  body('email').isEmail().withMessage('Email invàlid'),
  body('password').isLength({ min: 8 }).withMessage('La contrasenya ha de tenir almenys 8 caràcters'),
  body('firstName').notEmpty().withMessage('El nom és obligatori'),
  body('lastName').notEmpty().withMessage('Els cognoms són obligatoris'),
  body('role').isIn(['SUPERADMIN', 'ADMIN_CENTRE', 'ADMIN_CURS']).withMessage('Rol invàlid'),
];

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dades invàlides',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Buscar usuari
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        centre: true,
        curs: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credencials invàlides',
      });
    }

    // Verificar contrasenya
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credencials invàlides',
      });
    }

    // Verificar si l'usuari està actiu
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'El compte no està actiu',
      });
    }

    // Generar tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        centreId: user.centreId,
        cursId: user.cursId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    // Guardar sessió
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dies
      },
    });

    // Actualitzar últim login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Registrar activitat
    await createActivityLog({
      accio: 'LOGIN',
      taula: 'users',
      registreId: user.id,
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    logger.info(`Usuari ${user.email} ha iniciat sessió`);

    res.json({
      success: true,
      message: 'Login exitós',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          centre: user.centre,
          curs: user.curs,
        },
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hora
      },
    });
  } catch (error) {
    logger.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error intern del servidor',
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token és obligatori',
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    // Buscar sessió
    const session = await prisma.session.findFirst({
      where: {
        refreshToken,
        userId: decoded.userId,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          include: {
            centre: true,
            curs: true,
          },
        },
      },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token invàlid o expirat',
      });
    }

    // Generar nou access token
    const newAccessToken = jwt.sign(
      {
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
        centreId: session.user.centreId,
        cursId: session.user.cursId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Actualitzar sessió
    await prisma.session.update({
      where: { id: session.id },
      data: { token: newAccessToken },
    });

    res.json({
      success: true,
      message: 'Token renovat',
      data: {
        accessToken: newAccessToken,
        expiresIn: 3600,
      },
    });
  } catch (error) {
    logger.error('Error en refresh token:', error);
    res.status(401).json({
      success: false,
      message: 'Refresh token invàlid',
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Eliminar sessió
      await prisma.session.deleteMany({
        where: { refreshToken },
      });
    }

    res.json({
      success: true,
      message: 'Logout exitós',
    });
  } catch (error) {
    logger.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error intern del servidor',
    });
  }
});

// Registrar usuari (només per superadmin)
router.post('/register', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dades invàlides',
        errors: errors.array(),
      });
    }

    const { email, password, firstName, lastName, role, centreId, cursId } = req.body;

    // Verificar si l'email ja existeix
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'L\'email ja està registrat',
      });
    }

    // Encriptar contrasenya
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuari
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        centreId,
        cursId,
        createdBy: req.user?.id,
      },
      include: {
        centre: true,
        curs: true,
      },
    });

    // Registrar activitat
    await createActivityLog({
      accio: 'CREATE',
      taula: 'users',
      registreId: user.id,
      userId: req.user?.id,
      dadesNoves: { email, firstName, lastName, role },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    logger.info(`Usuari ${user.email} creat per ${req.user?.email}`);

    res.status(201).json({
      success: true,
      message: 'Usuari creat exitosament',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          centre: user.centre,
          curs: user.curs,
        },
      },
    });
  } catch (error) {
    logger.error('Error en registre:', error);
    res.status(500).json({
      success: false,
      message: 'Error intern del servidor',
    });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionat',
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Buscar usuari
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        centre: true,
        curs: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Usuari no trobat o inactiu',
      });
    }

    res.json({
      success: true,
      message: 'Token vàlid',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          centre: user.centre,
          curs: user.curs,
        },
      },
    });
  } catch (error) {
    logger.error('Error en verificació de token:', error);
    res.status(401).json({
      success: false,
      message: 'Token invàlid',
    });
  }
});

// Canviar contrasenya
router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Contrasenya actual és obligatòria'),
  body('newPassword').isLength({ min: 8 }).withMessage('La nova contrasenya ha de tenir almenys 8 caràcters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dades invàlides',
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No autoritzat',
      });
    }

    // Buscar usuari
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuari no trobat',
      });
    }

    // Verificar contrasenya actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contrasenya actual incorrecta',
      });
    }

    // Encriptar nova contrasenya
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Actualitzar contrasenya
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // Eliminar totes les sessions de l'usuari
    await prisma.session.deleteMany({
      where: { userId },
    });

    // Registrar activitat
    await createActivityLog({
      accio: 'UPDATE',
      taula: 'users',
      registreId: userId,
      userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    logger.info(`Usuari ${user.email} ha canviat la contrasenya`);

    res.json({
      success: true,
      message: 'Contrasenya canviada exitosament',
    });
  } catch (error) {
    logger.error('Error en canvi de contrasenya:', error);
    res.status(500).json({
      success: false,
      message: 'Error intern del servidor',
    });
  }
});

export default router;
