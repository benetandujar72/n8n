import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/dashboard/stats - Obtenir estadístiques del dashboard
router.get('/stats', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      totalCentres: 0,
      totalCursos: 0,
      totalUsuaris: 0,
      totalAssignatures: 0,
      totalProfessors: 0,
      totalAlumnes: 0,
      totalAvaluacions: 0,
      avaluacionsPendents: 0,
      avaluacionsCompletades: 0,
    },
    message: 'API del dashboard en desenvolupament',
  });
}));

// GET /api/dashboard/recent-activity - Obtenir activitat recent
router.get('/recent-activity', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API del dashboard en desenvolupament',
  });
}));

// GET /api/dashboard/charts - Obtenir dades per gràfics
router.get('/charts', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      avaluacionsPerMes: [],
      usuarisPerCentre: [],
      assignaturesPerCurs: [],
    },
    message: 'API del dashboard en desenvolupament',
  });
}));

export default router;
