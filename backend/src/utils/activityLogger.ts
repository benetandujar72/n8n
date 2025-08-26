import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { logger } from './logger';

export interface ActivityLogData {
  accio: string;
  taula: string;
  registreId?: string;
  dadesAnteriors?: any;
  dadesNoves?: any;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  centreId?: string;
  cursId?: string;
  assignaturaId?: string;
  professorId?: string;
  alumneId?: string;
  rubricaId?: string;
  avaluacioId?: string;
  integracioId?: string;
}

// Middleware per registrar activitats
export const activityLogger = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (data) {
    // Registrar activitat després de la resposta
    if (req.user && req.method !== 'GET') {
      const activityData: ActivityLogData = {
        accio: getActionFromMethod(req.method),
        taula: getTableFromUrl(req.url),
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };

      // Afegir dades específiques segons l'URL
      addSpecificData(activityData, req);

      createActivityLog(activityData).catch(error => {
        logger.error('Error creating activity log:', error);
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

export async function createActivityLog(data: ActivityLogData): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        action: data.accio,
        table: data.taula,
        recordId: data.registreId,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        details: data.dadesNoves,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    logger.error('Error creating activity log:', error);
    // Don't throw error to avoid breaking the main flow
  }
}

export async function getActivityLogs(
  userId?: string,
  table?: string,
  action?: string,
  limit = 100,
  offset = 0
) {
  const where: any = {};

  if (userId) where.userId = userId;
  if (table) where.table = table;
  if (action) where.action = action;

  return await prisma.activityLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
    skip: offset,
  });
}

// Funció per obtenir l'acció basada en el mètode HTTP
const getActionFromMethod = (method: string): string => {
  switch (method) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    case 'GET':
      return 'READ';
    default:
      return 'UNKNOWN';
  }
};

// Funció per obtenir la taula basada en l'URL
const getTableFromUrl = (url: string): string => {
  const path = url.split('?')[0] || '';
  const segments = path.split('/').filter(Boolean);

  if (segments.length >= 3) {
    return segments[2] || 'unknown'; // /api/centres -> centres
  }

  return 'unknown';
};

// Funció per afegir dades específiques segons l'URL
const addSpecificData = (data: ActivityLogData, req: Request) => {
  const path = req.url?.split('?')[0] || '';
  const segments = path.split('/').filter(Boolean);

  // Afegir ID del registre si està present a l'URL
  if (segments.length >= 4 && segments[3] !== 'search' && segments[3] !== 'stats') {
    data.registreId = segments[3];
  }

  // Afegir dades segons la taula
  switch (data.taula) {
    case 'centres':
      data.centreId = data.registreId;
      break;
    case 'cursos':
      data.cursId = data.registreId;
      if (req.body.centreId) data.centreId = req.body.centreId;
      break;
    case 'assignatures':
      data.assignaturaId = data.registreId;
      if (req.body.cursId) data.cursId = req.body.cursId;
      break;
    case 'professors':
      data.professorId = data.registreId;
      break;
    case 'alumnes':
      data.alumneId = data.registreId;
      if (req.body.centreId) data.centreId = req.body.centreId;
      if (req.body.cursId) data.cursId = req.body.cursId;
      break;
    case 'rubriques':
      data.rubricaId = data.registreId;
      if (req.body.assignaturaId) data.assignaturaId = req.body.assignaturaId;
      break;
    case 'avaluacions':
      data.avaluacioId = data.registreId;
      if (req.body.alumneId) data.alumneId = req.body.alumneId;
      if (req.body.rubricaId) data.rubricaId = req.body.rubricaId;
      break;
    case 'integracions':
      data.integracioId = data.registreId;
      if (req.body.centreId) data.centreId = req.body.centreId;
      break;
  }

  // Afegir dades del body per operacions de creació/actualització
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    data.dadesNoves = req.body;
  }
};

// Funció per registrar login/logout
export const logAuthActivity = async (userId: string, action: 'LOGIN' | 'LOGOUT', ipAddress?: string, userAgent?: string) => {
  await createActivityLog({
    accio: action,
    taula: 'users',
    registreId: userId,
    userId,
    ipAddress,
    userAgent,
  });
};

// Funció per registrar canvis de contrasenya
export const logPasswordChange = async (userId: string, ipAddress?: string, userAgent?: string) => {
  await createActivityLog({
    accio: 'PASSWORD_CHANGE',
    taula: 'users',
    registreId: userId,
    userId,
    ipAddress,
    userAgent,
  });
};

// Funció per registrar accés denegat
export const logAccessDenied = async (userId: string, resource: string, ipAddress?: string, userAgent?: string) => {
  await createActivityLog({
    accio: 'ACCESS_DENIED',
    taula: resource,
    userId,
    ipAddress,
    userAgent,
  });
};

// Funció per registrar errors del sistema
export const logSystemError = async (error: Error, userId?: string, context?: any) => {
  await createActivityLog({
    accio: 'SYSTEM_ERROR',
    taula: 'system',
    userId,
    dadesNoves: {
      error: error.message,
      stack: error.stack,
      context,
    },
  });
};

// Funció per obtenir l'historial d'activitats d'un usuari
export const getUserActivityHistory = async (userId: string, limit: number = 50) => {
  return await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      centre: true,
      curs: true,
      assignatura: true,
      professor: true,
      alumne: true,
      rubrica: true,
      avaluacio: true,
      integracio: true,
    },
  });
};

// Funció per obtenir l'historial d'activitats d'un centre
export const getCentreActivityHistory = async (centreId: string, limit: number = 50) => {
  return await prisma.activityLog.findMany({
    where: { centreId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: true,
      curs: true,
      assignatura: true,
      professor: true,
      alumne: true,
      rubrica: true,
      avaluacio: true,
      integracio: true,
    },
  });
};

// Funció per netejar logs antics
export const cleanupOldLogs = async (daysToKeep: number = 90) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.activityLog.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  logger.info(`Cleaned up ${result.count} old activity logs`);
  return result.count;
};
