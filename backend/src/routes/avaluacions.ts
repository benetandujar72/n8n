import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/avaluacions - Llistar avaluacions
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API d\'avaluacions en desenvolupament',
  });
}));

// GET /api/avaluacions/:id - Obtenir avaluacio per ID
router.get('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'API d\'avaluacions en desenvolupament',
  });
}));

// POST /api/avaluacions - Crear nova avaluacio
router.post('/', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API d\'avaluacions en desenvolupament',
  });
}));

// PUT /api/avaluacions/:id - Actualitzar avaluacio
router.put('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API d\'avaluacions en desenvolupament',
  });
}));

// DELETE /api/avaluacions/:id - Eliminar avaluacio
router.delete('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API d\'avaluacions en desenvolupament',
  });
}));

export default router;
