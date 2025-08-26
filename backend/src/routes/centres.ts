import { Router, Request, Response } from 'express';

import { body, query, validationResult } from 'express-validator';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { createActivityLog } from '../utils/activityLogger';
import { authMiddleware, requireSuperAdmin } from '../middleware/auth';
import { asyncHandler, createError, validateId, validatePagination } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/centres - Llistar centres amb paginació i filtres
router.get('/', validatePagination, asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (search) {
    where.OR = [
      { nom: { contains: String(search), mode: 'insensitive' } },
      { codi: { contains: String(search), mode: 'insensitive' } },
      { emailDomain: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  const [centres, total] = await Promise.all([
    prisma.centre.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            cursos: true,
          },
        },
      },
    }),
    prisma.centre.count({ where }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: centres,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    },
  });
}));

// GET /api/centres/:id - Obtenir centre per ID
router.get('/:id', validateId, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const centre = await prisma.centre.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
        },
      },
      cursos: {
        select: {
          id: true,
          nom: true,
          codi: true,
          status: true,
        },
      },
      _count: {
        select: {
          users: true,
          cursos: true,
          integracions: true,
        },
      },
    },
  });

  if (!centre) {
    throw createError('Centre no trobat', 404);
  }

  res.json({
    success: true,
    data: centre,
  });
}));

// POST /api/centres - Crear nou centre
router.post('/', requireSuperAdmin, [
  body('nom').trim().isLength({ min: 2, max: 100 }).withMessage('El nom ha de tenir entre 2 i 100 caràcters'),
  body('codi').trim().isLength({ min: 2, max: 20 }).withMessage('El codi ha de tenir entre 2 i 20 caràcters'),
  body('emailDomain').isEmail().withMessage('El domini d\'email ha de ser vàlid'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(errors.array()[0].msg, 400);
  }

  const { nom, codi, emailDomain } = req.body;

  // Verificar que el codi i emailDomain són únics
  const existingCentre = await prisma.centre.findFirst({
    where: {
      OR: [
        { codi },
        { emailDomain },
      ],
    },
  });

  if (existingCentre) {
    throw createError('Ja existeix un centre amb aquest codi o domini d\'email', 409);
  }

  const centre = await prisma.centre.create({
    data: {
      nom,
      codi,
      emailDomain,
    },
  });

  const userId = req.user?.id;
  if (userId) {
    await createActivityLog({
      accio: 'CREATE',
      taula: 'centres',
      registreId: centre.id,
      userId,
      ipAddress: req.ip || '',
      userAgent: req.get('User-Agent') || '',
      dadesNoves: { nom, codi, emailDomain },
    });
  }

  logger.info(`Centre creat: ${centre.nom} (${centre.id}) per usuari ${req.user?.email}`);

  res.status(201).json({
    success: true,
    data: centre,
    message: 'Centre creat correctament',
  });
}));

// PUT /api/centres/:id - Actualitzar centre
router.put('/:id', requireSuperAdmin, validateId, [
  body('nom').optional().trim().isLength({ min: 2, max: 100 }).withMessage('El nom ha de tenir entre 2 i 100 caràcters'),
  body('codi').optional().trim().isLength({ min: 2, max: 20 }).withMessage('El codi ha de tenir entre 2 i 20 caràcters'),
  body('emailDomain').optional().isEmail().withMessage('El domini d\'email ha de ser vàlid'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('L\'estat ha de ser ACTIVE o INACTIVE'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(errors.array()[0].msg, 400);
  }

  const { id } = req.params;
  const updateData = req.body;

  // Verificar que el centre existeix
  const existingCentre = await prisma.centre.findUnique({
    where: { id },
  });

  if (!existingCentre) {
    throw createError('Centre no trobat', 404);
  }

  // Verificar que el codi i emailDomain són únics (si s'estan actualitzant)
  if (updateData.codi || updateData.emailDomain) {
    const duplicateCentre = await prisma.centre.findFirst({
      where: {
        OR: [
          ...(updateData.codi ? [{ codi: updateData.codi }] : []),
          ...(updateData.emailDomain ? [{ emailDomain: updateData.emailDomain }] : []),
        ],
        NOT: { id },
      },
    });

    if (duplicateCentre) {
      throw createError('Ja existeix un centre amb aquest codi o domini d\'email', 409);
    }
  }

  const centre = await prisma.centre.update({
    where: { id },
    data: updateData,
  });

  const userId = req.user?.id;
  if (userId) {
    await createActivityLog({
      accio: 'UPDATE',
      taula: 'centres',
      registreId: centre.id,
      userId,
      ipAddress: req.ip || '',
      userAgent: req.get('User-Agent') || '',
      dadesNoves: updateData,
    });
  }

  logger.info(`Centre actualitzat: ${centre.nom} (${centre.id}) per usuari ${req.user?.email}`);

  res.json({
    success: true,
    data: centre,
    message: 'Centre actualitzat correctament',
  });
}));

// DELETE /api/centres/:id - Eliminar centre
router.delete('/:id', requireSuperAdmin, validateId, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Verificar que el centre existeix
  const centre = await prisma.centre.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          cursos: true,
        },
      },
    },
  });

  if (!centre) {
    throw createError('Centre no trobat', 404);
  }

  // Verificar que no té usuaris o cursos associats
  if (centre._count.users > 0 || centre._count.cursos > 0) {
    throw createError('No es pot eliminar un centre que té usuaris o cursos associats', 400);
  }

  await prisma.centre.delete({
    where: { id },
  });

  if (req.user?.id) {
    await createActivityLog({
      accio: 'DELETE',
      taula: 'centres',
      registreId: id,
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || '',
      dadesNoves: { nom: centre.nom, codi: centre.codi },
    });
  }

  logger.info(`Centre eliminat: ${centre.nom} (${centre.id}) per usuari ${req.user?.email}`);

  res.json({
    success: true,
    message: 'Centre eliminat correctament',
  });
}));

// GET /api/centres/:id/estadistiques - Obtenir estadístiques del centre
router.get('/:id/estadistiques', validateId, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const centre = await prisma.centre.findUnique({
    where: { id },
  });

  if (!centre) {
    throw createError('Centre no trobat', 404);
  }

  const [
    totalUsuaris,
    usuarisActius,
    totalCursos,
    cursosActius,
    totalAssignatures,
    totalProfessors,
    totalAlumnes,
  ] = await Promise.all([
    prisma.user.count({ where: { centreId: id } }),
    prisma.user.count({ where: { centreId: id, status: 'ACTIVE' } }),
    prisma.curs.count({ where: { centreId: id } }),
    prisma.curs.count({ where: { centreId: id, status: 'ACTIVE' } }),
    prisma.assignatura.count({ where: { curs: { centreId: id } } }),
    prisma.professor.count({ where: { curs: { centreId: id } } }),
    prisma.alumne.count({ where: { curs: { centreId: id } } }),
  ]);

  res.json({
    success: true,
    data: {
      centre,
      estadistiques: {
        usuaris: { total: totalUsuaris, actius: usuarisActius },
        cursos: { total: totalCursos, actius: cursosActius },
        assignatures: totalAssignatures,
        professors: totalProfessors,
        alumnes: totalAlumnes,
      },
    },
  });
}));

export default router;
