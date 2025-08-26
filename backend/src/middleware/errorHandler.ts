import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { logSystemError } from '../utils/activityLogger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode = 500, message } = error;

  // Log error
  logger.error(`Error: ${message}`, {
    statusCode,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: error.stack,
  });

  // Registrar error al sistema
  logSystemError(error, req.user?.id, {
    url: req.url,
    method: req.method,
    ip: req.ip,
  }).catch(logError => {
    logger.error('Error logging system error:', logError);
  });

  // En producció, no enviar stack trace
  if (process.env.NODE_ENV === 'production') {
    message = 'Error intern del servidor';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error: AppError = new Error(`Ruta no trobada: ${req.originalUrl}`);
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
};

// Funció per crear errors operacionals
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

// Funció per crear errors de validació
export const createValidationError = (message: string): AppError => {
  return createError(message, 400);
};

// Funció per crear errors d'autorització
export const createAuthError = (message: string = 'No autoritzat'): AppError => {
  return createError(message, 401);
};

// Funció per crear errors de permisos
export const createPermissionError = (message: string = 'Accés denegat'): AppError => {
  return createError(message, 403);
};

// Funció per crear errors de recurs no trobat
export const createNotFoundError = (message: string = 'Recurs no trobat'): AppError => {
  return createError(message, 404);
};

// Funció per crear errors de conflicte
export const createConflictError = (message: string = 'Conflicte de dades'): AppError => {
  return createError(message, 409);
};

// Funció per crear errors de validació de dades
export const createDataValidationError = (message: string = 'Dades invàlides'): AppError => {
  return createError(message, 422);
};

// Middleware per capturar errors asíncrons
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware per validar ID de MongoDB/ObjectId
export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id || id.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'ID invàlid',
    });
  }

  return next();
};

// Middleware per validar paginació
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Paràmetres de paginació invàlids',
    });
  }

  req.query.page = page.toString();
  req.query.limit = limit.toString();

  return next();
};

// Middleware per validar filtres de data
export const validateDateFilters = (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;

  if (startDate && !isValidDate(startDate as string)) {
    return res.status(400).json({
      success: false,
      message: 'Data d\'inici invàlida',
    });
  }

  if (endDate && !isValidDate(endDate as string)) {
    return res.status(400).json({
      success: false,
      message: 'Data de fi invàlida',
    });
  }

  if (startDate && endDate && new Date(startDate as string) > new Date(endDate as string)) {
    return res.status(400).json({
      success: false,
      message: 'La data d\'inici no pot ser posterior a la data de fi',
    });
  }

  return next();
};

// Funció per validar dates
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// Middleware per validar mida de fitxers
export const validateFileSize = (maxSize: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).file && (req as any).file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `El fitxer és massa gran. Mida màxima: ${maxSize / 1024 / 1024}MB`,
      });
    }

    return next();
  };
};

// Middleware per validar tipus de fitxers
export const validateFileType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).file && !allowedTypes.includes((req as any).file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Tipus de fitxer no permès. Tipus permesos: ${allowedTypes.join(', ')}`,
      });
    }

    return next();
  };
};
