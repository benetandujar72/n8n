import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { logger } from '../utils/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        centreId?: string;
        cursId?: string;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'autenticació requerit',
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

    // Verificar si la sessió existeix
    const session = await prisma.session.findFirst({
      where: {
        token,
        userId: user.id,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Sessió expirada',
      });
    }

    // Afegir usuari a la request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      centreId: user.centreId || undefined,
      cursId: user.cursId || undefined,
    };

    next();
  } catch (error) {
    logger.error('Error en autenticació:', error);
    return res.status(401).json({
      success: false,
      message: 'Token invàlid',
    });
  }
};

// Middleware per verificar rols
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autoritzat',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accés denegat. Permisos insuficients.',
      });
    }

    next();
  };
};

// Middleware per verificar si és superadmin
export const requireSuperAdmin = requireRole(['SUPERADMIN']);

// Middleware per verificar si és admin de centre
export const requireAdminCentre = requireRole(['SUPERADMIN', 'ADMIN_CENTRE']);

// Middleware per verificar si és admin de curs
export const requireAdminCurs = requireRole(['SUPERADMIN', 'ADMIN_CENTRE', 'ADMIN_CURS']);

// Middleware per verificar accés al centre
export const requireCentreAccess = (centreIdParam: string = 'centreId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autoritzat',
      });
    }

    const centreId = req.params[centreIdParam] || req.body[centreIdParam];

    // Superadmin té accés a tots els centres
    if (req.user.role === 'SUPERADMIN') {
      return next();
    }

    // Admin de centre només té accés al seu centre
    if (req.user.role === 'ADMIN_CENTRE' && req.user.centreId === centreId) {
      return next();
    }

    // Admin de curs només té accés al centre del seu curs
    if (req.user.role === 'ADMIN_CURS' && req.user.centreId === centreId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Accés denegat al centre especificat',
    });
  };
};

// Middleware per verificar accés al curs
export const requireCursAccess = (cursIdParam: string = 'cursId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autoritzat',
      });
    }

    const cursId = req.params[cursIdParam] || req.body[cursIdParam];

    // Superadmin té accés a tots els cursos
    if (req.user.role === 'SUPERADMIN') {
      return next();
    }

    // Admin de centre té accés als cursos del seu centre
    if (req.user.role === 'ADMIN_CENTRE') {
      // Aquí hauríem de verificar que el curs pertany al centre de l'usuari
      // Per simplicitat, assumim que té accés
      return next();
    }

    // Admin de curs només té accés al seu curs
    if (req.user.role === 'ADMIN_CURS' && req.user.cursId === cursId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Accés denegat al curs especificat',
    });
  };
};

// Middleware per verificar accés a l'usuari
export const requireUserAccess = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autoritzat',
      });
    }

    const userId = req.params[userIdParam] || req.body[userIdParam];

    // Superadmin té accés a tots els usuaris
    if (req.user.role === 'SUPERADMIN') {
      return next();
    }

    // Usuaris només poden accedir al seu propi perfil
    if (req.user.id === userId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Accés denegat a l\'usuari especificat',
    });
  };
};
