import { Server } from 'socket.io';
import { logger } from '../utils/logger';
import { prisma } from '../index';

export const setupWebSocketHandlers = (io: Server) => {
  // Middleware d'autenticació per WebSocket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Token no proporcionat'));
      }

      // Aquí verificaríem el token JWT
      // Per ara, acceptem qualsevol token
      socket.data.user = { id: 'user-id', email: 'user@example.com' };
      next();
    } catch (error) {
      logger.error('Error d\'autenticació WebSocket:', error);
      next(new Error('Error d\'autenticació'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`WebSocket connectat: ${socket.id}`);

    // Unir-se a la sala de l'usuari
    socket.join(`user-${socket.data.user.id}`);

    // Unir-se a la sala del centre si l'usuari té centre
    if (socket.data.user.centreId) {
      socket.join(`centre-${socket.data.user.centreId}`);
    }

    // Unir-se a la sala del curs si l'usuari té curs
    if (socket.data.user.cursId) {
      socket.join(`curs-${socket.data.user.cursId}`);
    }

    // Unir-se a la sala global
    socket.join('global');

    // Event per obtenir l'estat del sistema
    socket.on('get-system-status', async () => {
      try {
        const systemStatus = {
          n8nStatus: 'offline',
          databaseStatus: 'online',
          lastBackup: new Date().toISOString(),
          activeWorkflows: 0,
          pendingEvaluations: 0,
        };

        socket.emit('system-status', systemStatus);
      } catch (error) {
        logger.error('Error obtenint estat del sistema:', error);
      }
    });

    // Event per unir-se a una sala específica
    socket.on('join-room', (data) => {
      const { room } = data;
      socket.join(room);
      logger.info(`Usuari ${socket.data.user.id} unit a la sala: ${room}`);
    });

    // Event per sortir d'una sala específica
    socket.on('leave-room', (data) => {
      const { room } = data;
      socket.leave(room);
      logger.info(`Usuari ${socket.data.user.id} ha sortit de la sala: ${room}`);
    });

    // Event per enviar missatge personalitzat
    socket.on('custom-message', (data) => {
      const { room, message } = data;
      io.to(room).emit('custom-message', {
        ...message,
        timestamp: new Date().toISOString(),
        userId: socket.data.user.id,
      });
    });

    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket desconnectat: ${socket.id}, raó: ${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`Error WebSocket: ${socket.id}`, error);
    });
  });

  // Funció per enviar notificació a un usuari específic
  export const sendNotificationToUser = (userId: string, notification: any) => {
    io.to(`user-${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  };

  // Funció per enviar notificació a un centre
  export const sendNotificationToCentre = (centreId: string, notification: any) => {
    io.to(`centre-${centreId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  };

  // Funció per enviar notificació a un curs
  export const sendNotificationToCurs = (cursId: string, notification: any) => {
    io.to(`curs-${cursId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  };

  // Funció per enviar notificació global
  export const sendGlobalNotification = (notification: any) => {
    io.to('global').emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  };

  // Funció per actualitzar l'estat del sistema
  export const updateSystemStatus = (status: any) => {
    io.to('global').emit('system-status', {
      ...status,
      timestamp: new Date().toISOString(),
    });
  };

  // Funció per notificar actualització de workflow
  export const notifyWorkflowUpdate = (workflowData: any) => {
    io.to('global').emit('workflow-update', {
      ...workflowData,
      timestamp: new Date().toISOString(),
    });
  };

  // Funció per notificar avaluació completada
  export const notifyEvaluationComplete = (evaluationData: any) => {
    io.to('global').emit('evaluation-complete', {
      ...evaluationData,
      timestamp: new Date().toISOString(),
    });
  };

  // Funció per notificar backup completat
  export const notifyBackupComplete = (backupData: any) => {
    io.to('global').emit('backup-complete', {
      ...backupData,
      timestamp: new Date().toISOString(),
    });
  };

  logger.info('✅ WebSocket handlers configurats');
};
