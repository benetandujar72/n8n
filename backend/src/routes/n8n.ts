import { Router } from 'express';
import { prisma } from '../index';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Middleware d'autenticació per totes les rutes
router.use(authMiddleware);

// GET /api/n8n/status - Obtenir estat de n8n
router.get('/status', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'offline',
      lastCheck: new Date().toISOString(),
      workflows: 0,
      activeWorkflows: 0,
    },
    message: 'API de n8n en desenvolupament',
  });
}));

// GET /api/n8n/workflows - Llistar workflows
router.get('/workflows', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'API de n8n en desenvolupament',
  });
}));

// POST /api/n8n/workflows - Crear nou workflow
router.post('/workflows', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de n8n en desenvolupament',
  });
}));

// PUT /api/n8n/workflows/:id - Actualitzar workflow
router.put('/workflows/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de n8n en desenvolupament',
  });
}));

// DELETE /api/n8n/workflows/:id - Eliminar workflow
router.delete('/workflows/:id', asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'API de n8n en desenvolupament',
  });
}));

export default router;
