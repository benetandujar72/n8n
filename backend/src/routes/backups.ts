import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/backups - Llistar backups
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API de backups en desenvolupament',
  });
}));

// GET /api/backups/:id - Obtenir backup per ID
router.get('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'API de backups en desenvolupament',
  });
}));

// POST /api/backups - Crear nou backup
router.post('/', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de backups en desenvolupament',
  });
}));

// DELETE /api/backups/:id - Eliminar backup
router.delete('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de backups en desenvolupament',
  });
}));

// POST /api/backups/:id/restore - Restaurar backup
router.post('/:id/restore', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de backups en desenvolupament',
  });
}));

export default router;
