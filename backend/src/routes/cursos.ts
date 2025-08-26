import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { createActivityLog } from '../utils/activityLogger';
import { authMiddleware, requireAdminCentre, requireCentreAccess } from '../middleware/auth';
import { asyncHandler, createError, validateId, validatePagination } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/cursos - Llistar cursos amb paginació i filtres
router.get('/', validatePagination, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, centreId } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (search) {
    where.OR = [
      { nom: { contains: String(search), mode: 'insensitive' } },
      { codi: { contains: String(search), mode: 'insensitive' } },
    ];
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

  const [cursos, total] = await Promise.all([
    prisma.curs.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        centre: {
          select: {
            id: true,
            nom: true,
            codi: true,
          },
        },
        _count: {
          select: {
            assignatures: true,
            professors: true,
            alumnes: true,
          },
        },
      },
    }),
    prisma.curs.count({ where }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: cursos,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    },
  });
}));

// GET /api/cursos/:id - Obtenir curs per ID
router.get('/:id', validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const curs = await prisma.curs.findUnique({
    where: { id },
    include: {
      centre: {
        select: {
          id: true,
          nom: true,
          codi: true,
        },
      },
      assignatures: {
        select: {
          id: true,
          nom: true,
          codi: true,
          status: true,
        },
      },
      professors: {
        select: {
          id: true,
          nom: true,
          cognoms: true,
          email: true,
          status: true,
        },
      },
      alumnes: {
        select: {
          id: true,
          nom: true,
          cognoms: true,
          email: true,
          status: true,
        },
      },
      _count: {
        select: {
          assignatures: true,
          professors: true,
          alumnes: true,
        },
      },
    },
  });

  if (!curs) {
    throw createError('Curs no trobat', 404);
  }

  // Verificar accés al centre
  if (req.user!.role !== 'SUPERADMIN' && curs.centreId !== req.user!.centreId) {
    throw createError('No tens accés a aquest curs', 403);
  }

  res.json({
    success: true,
    data: curs,
  });
}));

// POST /api/cursos - Crear nou curs
router.post('/', requireAdminCentre, [
  body('nom').trim().isLength({ min: 2, max: 100 }).withMessage('El nom ha de tenir entre 2 i 100 caràcters'),
  body('codi').trim().isLength({ min: 2, max: 20 }).withMessage('El codi ha de tenir entre 2 i 20 caràcters'),
  body('centreId').isUUID().withMessage('L\'ID del centre ha de ser vàlid'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(errors.array()[0].msg, 400);
  }

  const { nom, codi, centreId } = req.body;

  // Verificar que l'usuari té accés al centre
  if (req.user!.role !== 'SUPERADMIN' && centreId !== req.user!.centreId) {
    throw createError('No tens accés a aquest centre', 403);
  }

  // Verificar que el centre existeix
  const centre = await prisma.centre.findUnique({
    where: { id: centreId },
  });

  if (!centre) {
    throw createError('Centre no trobat', 404);
  }

  // Verificar que el codi és únic dins del centre
  const existingCurs = await prisma.curs.findFirst({
    where: {
      codi,
      centreId,
    },
  });

  if (existingCurs) {
    throw createError('Ja existeix un curs amb aquest codi en aquest centre', 409);
  }

  const curs = await prisma.curs.create({
    data: {
      nom,
      codi,
      centreId,
    },
  });

  await createActivityLog({
    action: 'CREATE',
    table: 'cursos',
    recordId: curs.id,
    userId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent') || '',
    details: { nom, codi, centreId },
  });

  logger.info(`Curs creat: ${curs.nom} (${curs.id}) per usuari ${req.user!.email}`);

  res.status(201).json({
    success: true,
    data: curs,
    message: 'Curs creat correctament',
  });
}));

// PUT /api/cursos/:id - Actualitzar curs
router.put('/:id', requireAdminCentre, validateId, [
  body('nom').optional().trim().isLength({ min: 2, max: 100 }).withMessage('El nom ha de tenir entre 2 i 100 caràcters'),
  body('codi').optional().trim().isLength({ min: 2, max: 20 }).withMessage('El codi ha de tenir entre 2 i 20 caràcters'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('L\'estat ha de ser ACTIVE o INACTIVE'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError(errors.array()[0].msg, 400);
  }

  const { id } = req.params;
  const updateData = req.body;

  // Verificar que el curs existeix
  const existingCurs = await prisma.curs.findUnique({
    where: { id },
    include: {
      centre: true,
    },
  });

  if (!existingCurs) {
    throw createError('Curs no trobat', 404);
  }

  // Verificar que l'usuari té accés al curs
  if (req.user!.role !== 'SUPERADMIN' && existingCurs.centreId !== req.user!.centreId) {
    throw createError('No tens accés a aquest curs', 403);
  }

  // Verificar que el codi és únic dins del centre (si s'està actualitzant)
  if (updateData.codi) {
    const duplicateCurs = await prisma.curs.findFirst({
      where: {
        codi: updateData.codi,
        centreId: existingCurs.centreId,
        NOT: { id },
      },
    });

    if (duplicateCurs) {
      throw createError('Ja existeix un curs amb aquest codi en aquest centre', 409);
    }
  }

  const curs = await prisma.curs.update({
    where: { id },
    data: updateData,
  });

  await createActivityLog({
    action: 'UPDATE',
    table: 'cursos',
    recordId: curs.id,
    userId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent') || '',
    details: updateData,
  });

  logger.info(`Curs actualitzat: ${curs.nom} (${curs.id}) per usuari ${req.user!.email}`);

  res.json({
    success: true,
    data: curs,
    message: 'Curs actualitzat correctament',
  });
}));

// DELETE /api/cursos/:id - Eliminar curs
router.delete('/:id', requireAdminCentre, validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verificar que el curs existeix
  const curs = await prisma.curs.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          assignatures: true,
          professors: true,
          alumnes: true,
        },
      },
    },
  });

  if (!curs) {
    throw createError('Curs no trobat', 404);
  }

  // Verificar que l'usuari té accés al curs
  if (req.user!.role !== 'SUPERADMIN' && curs.centreId !== req.user!.centreId) {
    throw createError('No tens accés a aquest curs', 403);
  }

  // Verificar que no té assignatures, professors o alumnes associats
  if (curs._count.assignatures > 0 || curs._count.professors > 0 || curs._count.alumnes > 0) {
    throw createError('No es pot eliminar un curs que té assignatures, professors o alumnes associats', 400);
  }

  await prisma.curs.delete({
    where: { id },
  });

  await createActivityLog({
    action: 'DELETE',
    table: 'cursos',
    recordId: id,
    userId: req.user!.id,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent') || '',
    details: { nom: curs.nom, codi: curs.codi },
  });

  logger.info(`Curs eliminat: ${curs.nom} (${curs.id}) per usuari ${req.user!.email}`);

  res.json({
    success: true,
    message: 'Curs eliminat correctament',
  });
}));

// GET /api/cursos/:id/estadistiques - Obtenir estadístiques del curs
router.get('/:id/estadistiques', validateId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const curs = await prisma.curs.findUnique({
    where: { id },
  });

  if (!curs) {
    throw createError('Curs no trobat', 404);
  }

  // Verificar que l'usuari té accés al curs
  if (req.user!.role !== 'SUPERADMIN' && curs.centreId !== req.user!.centreId) {
    throw createError('No tens accés a aquest curs', 403);
  }

  const [
    totalAssignatures,
    assignaturesActives,
    totalProfessors,
    professorsActius,
    totalAlumnes,
    alumnesActius,
  ] = await Promise.all([
    prisma.assignatura.count({ where: { cursId: id } }),
    prisma.assignatura.count({ where: { cursId: id, status: 'ACTIVE' } }),
    prisma.professor.count({ where: { cursId: id } }),
    prisma.professor.count({ where: { cursId: id, status: 'ACTIVE' } }),
    prisma.alumne.count({ where: { cursId: id } }),
    prisma.alumne.count({ where: { cursId: id, status: 'ACTIVE' } }),
  ]);

  res.json({
    success: true,
    data: {
      curs,
      estadistiques: {
        assignatures: { total: totalAssignatures, actives: assignaturesActives },
        professors: { total: totalProfessors, actius: professorsActius },
        alumnes: { total: totalAlumnes, actius: alumnesActius },
      },
    },
  });
}));

export default router;
