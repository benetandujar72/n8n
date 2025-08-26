import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { createActivityLog } from '../utils/activityLogger';
import { authMiddleware, requireSuperAdmin, requireAdminCentre } from '../middleware/auth';
import { asyncHandler, createError, validateId, validatePagination } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/users - Llistar usuaris amb paginació i filtres
router.get('/', validatePagination, asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, role, status, centreId } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (search) {
    where.OR = [
      { email: { contains: String(search), mode: 'insensitive' } },
      { firstName: { contains: String(search), mode: 'insensitive' } },
      { lastName: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status) {
    where.status = status;
  }

  if (centreId) {
    where.centreId = centreId;
  }

  // Filtrar per centre si l'usuari no és superadmin
  if (req.user!.role !== 'SUPERADMIN') {
    where.centreId = req.user!.centreId;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        centre: {
          select: {
            id: true,
            nom: true,
            codi: true,
          },
        },
        curs: {
          select: {
            id: true,
            nom: true,
            codi: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    },
  });
}));

// GET /api/users/:id - Obtenir usuari per ID
router.get('/:id', validateId, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      emailVerified: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
      centre: {
        select: {
          id: true,
          nom: true,
          codi: true,
        },
      },
      curs: {
        select: {
          id: true,
          nom: true,
          codi: true,
        },
      },
    },
  });

  if (!user) {
    throw createError('Usuari no trobat', 404);
  }

  // Verificar accés al centre
  if (req.user!.role !== 'SUPERADMIN' && user.centre?.id !== req.user!.centreId) {
    throw createError('No tens accés a aquest usuari', 403);
  }

  res.json({
    success: true,
    data: user,
  });
}));

// POST /api/users - Crear nou usuari
router.post('/', requireAdminCentre, [
  body('email').isEmail().withMessage('L\'email ha de ser vàlid'),
  body('password').isLength({ min: 6 }).withMessage('La contrasenya ha de tenir almenys 6 caràcters'),
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('El nom ha de tenir entre 2 i 50 caràcters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Els cognoms han de tenir entre 2 i 50 caràcters'),
  body('role').isIn(['SUPERADMIN', 'ADMIN_CENTRE', 'ADMIN_CURS']).withMessage('El rol ha de ser vàlid'),
  body('centreId').optional().isUUID().withMessage('L\'ID del centre ha de ser vàlid'),
  body('cursId').optional().isUUID().withMessage('L\'ID del curs ha de ser vàlid'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(errors.array()[0].msg, 400);
  }

  const { email, password, firstName, lastName, role, centreId, cursId } = req.body;

  // Verificar que l'usuari té permisos per crear usuaris amb aquest rol
  if (req.user!.role !== 'SUPERADMIN' && role === 'SUPERADMIN') {
    throw createError('No tens permisos per crear superadministradors', 403);
  }

  if (req.user!.role === 'ADMIN_CENTRE' && role === 'ADMIN_CENTRE') {
    throw createError('No tens permisos per crear administradors de centre', 403);
  }

  // Verificar que l'email és únic
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createError('Ja existeix un usuari amb aquest email', 409);
  }

  // Verificar que el centre existeix (si s'especifica)
  if (centreId) {
    const centre = await prisma.centre.findUnique({
      where: { id: centreId },
    });

    if (!centre) {
      throw createError('Centre no trobat', 404);
    }

    // Verificar que l'usuari té accés al centre
    if (req.user!.role !== 'SUPERADMIN' && centreId !== req.user!.centreId) {
      throw createError('No tens accés a aquest centre', 403);
    }
  }

  // Verificar que el curs existeix (si s'especifica)
  if (cursId) {
    const curs = await prisma.curs.findUnique({
      where: { id: cursId },
    });

    if (!curs) {
      throw createError('Curs no trobat', 404);
    }

    // Verificar que l'usuari té accés al curs
    if (req.user!.role !== 'SUPERADMIN' && curs.centreId !== req.user!.centreId) {
      throw createError('No tens accés a aquest curs', 403);
    }
  }

  // Hash de la contrasenya
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      centreId,
      cursId,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      emailVerified: true,
      createdAt: true,
      centre: {
        select: {
          id: true,
          nom: true,
          codi: true,
        },
      },
      curs: {
        select: {
          id: true,
          nom: true,
          codi: true,
        },
      },
    },
  });

  const userId = req.user?.id;
  if (userId) {
    await createActivityLog({
      accio: 'CREATE',
      taula: 'users',
      registreId: user.id,
      userId,
      ipAddress: req.ip || '',
      userAgent: req.get('User-Agent') || '',
      dadesNoves: { email, firstName, lastName, role, centreId, cursId },
    });
  }

  logger.info(`Usuari creat: ${user.email} (${user.id}) per usuari ${req.user!.email}`);

  res.status(201).json({
    success: true,
    data: user,
    message: 'Usuari creat correctament',
  });
}));

// PUT /api/users/:id - Actualitzar usuari
router.put('/:id', requireAdminCentre, validateId, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('El nom ha de tenir entre 2 i 50 caràcters'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Els cognoms han de tenir entre 2 i 50 caràcters'),
  body('role').optional().isIn(['SUPERADMIN', 'ADMIN_CENTRE', 'ADMIN_CURS']).withMessage('El rol ha de ser vàlid'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']).withMessage('L\'estat ha de ser vàlid'),
  body('centreId').optional().isUUID().withMessage('L\'ID del centre ha de ser vàlid'),
  body('cursId').optional().isUUID().withMessage('L\'ID del curs ha de ser vàlid'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(errors.array()[0].msg, 400);
  }

  const { id } = req.params;
  const updateData = req.body;

  // Verificar que l'usuari existeix
  const existingUser = await prisma.user.findUnique({
    where: { id },
    include: {
      centre: true,
    },
  });

  if (!existingUser) {
    throw createError('Usuari no trobat', 404);
  }

  // Verificar que l'usuari té accés a l'usuari
  if (req.user!.role !== 'SUPERADMIN' && existingUser.centre?.id !== req.user!.centreId) {
    throw createError('No tens accés a aquest usuari', 403);
  }

  // Verificar que l'usuari té permisos per actualitzar usuaris amb aquest rol
  if (req.user!.role !== 'SUPERADMIN' && updateData.role === 'SUPERADMIN') {
    throw createError('No tens permisos per assignar rol de superadministrador', 403);
  }

  if (req.user!.role === 'ADMIN_CENTRE' && updateData.role === 'ADMIN_CENTRE') {
    throw createError('No tens permisos per assignar rol d\'administrador de centre', 403);
  }

  // Verificar que el centre existeix (si s'està actualitzant)
  if (updateData.centreId) {
    const centre = await prisma.centre.findUnique({
      where: { id: updateData.centreId },
    });

    if (!centre) {
      throw createError('Centre no trobat', 404);
    }

    // Verificar que l'usuari té accés al centre
    if (req.user!.role !== 'SUPERADMIN' && updateData.centreId !== req.user!.centreId) {
      throw createError('No tens accés a aquest centre', 403);
    }
  }

  // Verificar que el curs existeix (si s'està actualitzant)
  if (updateData.cursId) {
    const curs = await prisma.curs.findUnique({
      where: { id: updateData.cursId },
    });

    if (!curs) {
      throw createError('Curs no trobat', 404);
    }

    // Verificar que l'usuari té accés al curs
    if (req.user!.role !== 'SUPERADMIN' && curs.centreId !== req.user!.centreId) {
      throw createError('No tens accés a aquest curs', 403);
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      emailVerified: true,
      updatedAt: true,
      centre: {
        select: {
          id: true,
          nom: true,
          codi: true,
        },
      },
      curs: {
        select: {
          id: true,
          nom: true,
          codi: true,
        },
      },
    },
  });

  const userId = req.user?.id;
  if (userId) {
    await createActivityLog({
      accio: 'UPDATE',
      taula: 'users',
      registreId: user.id,
      userId,
      ipAddress: req.ip || '',
      userAgent: req.get('User-Agent') || '',
      dadesNoves: updateData,
    });
  }

  logger.info(`Usuari actualitzat: ${user.email} (${user.id}) per usuari ${req.user!.email}`);

  res.json({
    success: true,
    data: user,
    message: 'Usuari actualitzat correctament',
  });
}));

// DELETE /api/users/:id - Eliminar usuari
router.delete('/:id', requireAdminCentre, validateId, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verificar que l'usuari existeix
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      centre: true,
    },
  });

  if (!user) {
    throw createError('Usuari no trobat', 404);
  }

  // Verificar que l'usuari té accés a l'usuari
  if (req.user!.role !== 'SUPERADMIN' && user.centre?.id !== req.user!.centreId) {
    throw createError('No tens accés a aquest usuari', 403);
  }

  // No es pot eliminar a si mateix
  if (user.id === req.user!.id) {
    throw createError('No pots eliminar el teu propi compte', 400);
  }

  // No es pot eliminar un superadmin si no és superadmin
  if (user.role === 'SUPERADMIN' && req.user!.role !== 'SUPERADMIN') {
    throw createError('No tens permisos per eliminar superadministradors', 403);
  }

  await prisma.user.delete({
    where: { id },
  });

  const userId = req.user?.id;
  if (userId) {
    await createActivityLog({
      accio: 'DELETE',
      taula: 'users',
      registreId: id,
      userId,
      ipAddress: req.ip || '',
      userAgent: req.get('User-Agent') || '',
      dadesNoves: { email: user.email, firstName: user.firstName, lastName: user.lastName },
    });
  }

  logger.info(`Usuari eliminat: ${user.email} (${user.id}) per usuari ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Usuari eliminat correctament',
  });
}));

export default router;
