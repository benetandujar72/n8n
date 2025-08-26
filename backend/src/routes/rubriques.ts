import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/rubriques - Llistar rubriques
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API de rubriques en desenvolupament',
  });
}));

// GET /api/rubriques/:id - Obtenir rubrica per ID
router.get('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'API de rubriques en desenvolupament',
  });
}));

// POST /api/rubriques - Crear nova rubrica
router.post('/', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de rubriques en desenvolupament',
  });
}));

// PUT /api/rubriques/:id - Actualitzar rubrica
router.put('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de rubriques en desenvolupament',
  });
}));

// DELETE /api/rubriques/:id - Eliminar rubrica
router.delete('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de rubriques en desenvolupament',
  });
}));

export default router;
