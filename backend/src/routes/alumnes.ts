import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/alumnes - Llistar alumnes
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API d\'alumnes en desenvolupament',
  });
}));

// GET /api/alumnes/:id - Obtenir alumne per ID
router.get('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'API d\'alumnes en desenvolupament',
  });
}));

// POST /api/alumnes - Crear nou alumne
router.post('/', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API d\'alumnes en desenvolupament',
  });
}));

// PUT /api/alumnes/:id - Actualitzar alumne
router.put('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API d\'alumnes en desenvolupament',
  });
}));

// DELETE /api/alumnes/:id - Eliminar alumne
router.delete('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API d\'alumnes en desenvolupament',
  });
}));

export default router;
