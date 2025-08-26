import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/notifications - Llistar notifications
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API de notifications en desenvolupament',
  });
}));

// GET /api/notifications/:id - Obtenir notification per ID
router.get('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'API de notifications en desenvolupament',
  });
}));

// POST /api/notifications - Crear nova notification
router.post('/', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de notifications en desenvolupament',
  });
}));

// PUT /api/notifications/:id - Actualitzar notification
router.put('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de notifications en desenvolupament',
  });
}));

// DELETE /api/notifications/:id - Eliminar notification
router.delete('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de notifications en desenvolupament',
  });
}));

export default router;
