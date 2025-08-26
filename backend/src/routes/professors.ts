import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/professors - Llistar professors
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API de professors en desenvolupament',
  });
}));

// GET /api/professors/:id - Obtenir professor per ID
router.get('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'API de professors en desenvolupament',
  });
}));

// POST /api/professors - Crear nou professor
router.post('/', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de professors en desenvolupament',
  });
}));

// PUT /api/professors/:id - Actualitzar professor
router.put('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de professors en desenvolupament',
  });
}));

// DELETE /api/professors/:id - Eliminar professor
router.delete('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de professors en desenvolupament',
  });
}));

export default router;
