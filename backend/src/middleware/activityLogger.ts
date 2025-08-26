import { Request, Response, NextFunction } from 'express';
import { createActivityLog } from '../utils/activityLogger';

export const activityLogger = (req: Request, res: Response, next: NextFunction) => {
  // Només registrar activitat per peticions no-GET
  if (req.method === 'GET') {
    return next();
  }

  // Interceptar la resposta per registrar l'activitat
  const originalSend = res.send;
  res.send = function (body) {
    // Registrar l'activitat després de la resposta
    if (req.user) {
      createActivityLog({
        action: req.method,
        table: getTableFromPath(req.path),
        recordId: getRecordIdFromPath(req.path),
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        details: {
          path: req.path,
          method: req.method,
          body: req.body,
          statusCode: res.statusCode,
        },
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

// Funció auxiliar per obtenir la taula de la ruta
const getTableFromPath = (path: string): string => {
  const pathParts = path.split('/');
  if (pathParts.length >= 3) {
    return pathParts[2]; // /api/table/...
  }
  return 'unknown';
};

// Funció auxiliar per obtenir l'ID del registre de la ruta
const getRecordIdFromPath = (path: string): string | null => {
  const pathParts = path.split('/');
  if (pathParts.length >= 4) {
    return pathParts[3]; // /api/table/id
  }
  return null;
};
