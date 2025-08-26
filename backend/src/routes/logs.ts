import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/logs - Llistar logs
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API de logs en desenvolupament',
  });
}));

// GET /api/logs/:id - Obtenir log per ID
router.get('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'API de logs en desenvolupament',
  });
}));

// GET /api/logs/system - Obtenir logs del sistema
router.get('/system', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API de logs en desenvolupament',
  });
}));

// GET /api/logs/activity - Obtenir logs d'activitat
router.get('/activity', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API de logs en desenvolupament',
  });
}));

export default router;
