import winston from 'winston';
import path from 'path';

// Definir nivells de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definir colors per cada nivell
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Afegir colors a Winston
winston.addColors(colors);

// Definir format per les línies de log
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Definir transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),

  // File transport per errors
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),

  // File transport per tots els logs
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Crear logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
});

// Crear stream per Morgan (HTTP logging)
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Funció per registrar errors amb context
export const logError = (error: Error, context?: any) => {
  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Funció per registrar activitats d'usuari
export const logUserActivity = (userId: string, action: string, details?: any) => {
  logger.info(`User Activity: ${action}`, {
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Funció per registrar accés a l'API
export const logApiAccess = (method: string, url: string, userId?: string, statusCode?: number) => {
  logger.http(`API Access: ${method} ${url}`, {
    method,
    url,
    userId,
    statusCode,
    timestamp: new Date().toISOString(),
  });
};

// Funció per registrar operacions de base de dades
export const logDatabaseOperation = (operation: string, table: string, recordId?: string, userId?: string) => {
  logger.info(`Database Operation: ${operation}`, {
    operation,
    table,
    recordId,
    userId,
    timestamp: new Date().toISOString(),
  });
};

// Funció per registrar operacions de seguretat
export const logSecurityEvent = (event: string, userId?: string, ipAddress?: string, details?: any) => {
  logger.warn(`Security Event: ${event}`, {
    event,
    userId,
    ipAddress,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Funció per registrar operacions de sistema
export const logSystemEvent = (event: string, details?: any) => {
  logger.info(`System Event: ${event}`, {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};
