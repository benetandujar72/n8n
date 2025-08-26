import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/assignatures - Llistar assignatures
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API d\'assignatures en desenvolupament',
  });
}));

// GET /api/assignatures/:id - Obtenir assignatura per ID
router.get('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'API d\'assignatures en desenvolupament',
  });
}));

// POST /api/assignatures - Crear nova assignatura
router.post('/', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API d\'assignatures en desenvolupament',
  });
}));

// PUT /api/assignatures/:id - Actualitzar assignatura
router.put('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API d\'assignatures en desenvolupament',
  });
}));

// DELETE /api/assignatures/:id - Eliminar assignatura
router.delete('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API d\'assignatures en desenvolupament',
  });
}));

export default router;
