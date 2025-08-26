import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/integracions - Llistar integracions
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API d\'integracions en desenvolupament',
  });
}));

// GET /api/integracions/:id - Obtenir integracio per ID
router.get('/:id', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: null,
    message: 'API d\'integracions en desenvolupament',
  });
}));

// POST /api/integracions - Crear nova integracio
router.post('/', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API d\'integracions en desenvolupament',
  });
}));

// PUT /api/integracions/:id - Actualitzar integracio
router.put('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API d\'integracions en desenvolupament',
  });
}));

// DELETE /api/integracions/:id - Eliminar integracio
router.delete('/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API d\'integracions en desenvolupament',
  });
}));

export default router;
