import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/configuracions - Llistar configuracions
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API de configuracions en desenvolupament',
  });
}));

// GET /api/configuracions/:id - Obtenir configuracio per ID
router.get('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'API de configuracions en desenvolupament',
  });
}));

// POST /api/configuracions - Crear nova configuracio
router.post('/', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de configuracions en desenvolupament',
  });
}));

// PUT /api/configuracions/:id - Actualitzar configuracio
router.put('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de configuracions en desenvolupament',
  });
}));

// DELETE /api/configuracions/:id - Eliminar configuracio
router.delete('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de configuracions en desenvolupament',
  });
}));

export default router;
