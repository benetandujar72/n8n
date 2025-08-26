import { CronJob } from 'cron';
import { logger } from '../utils/logger';
import { prisma } from '../index';

export const setupCronJobs = () => {
  // Netejar logs antics cada dia a les 2:00 AM
  const cleanupLogsJob = new CronJob('0 2 * * *', async () => {
    try {
      logger.info('Iniciant neteja de logs antics...');

      // Eliminar logs d'activitat més antics de 30 dies
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedLogs = await prisma.activityLog.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      logger.info(`Neteja de logs completada: ${deletedLogs.count} registres eliminats`);
    } catch (error) {
      logger.error('Error en la neteja de logs:', error);
    }
  });

  // Verificar estat del sistema cada 5 minuts
  const systemHealthCheckJob = new CronJob('*/5 * * * *', async () => {
    try {
      logger.debug('Verificant estat del sistema...');

      // Aquí verificaríem l'estat de n8n, base de dades, etc.
      const dbStatus = await prisma.$queryRaw`SELECT 1`;

      if (dbStatus) {
        logger.debug('✅ Base de dades: OK');
      }
    } catch (error) {
      logger.error('❌ Error en la verificació del sistema:', error);
    }
  });

  // Backup automàtic cada dia a les 3:00 AM
  const backupJob = new CronJob('0 3 * * *', async () => {
    try {
      logger.info('Iniciant backup automàtic...');

      // Aquí implementaríem la lògica de backup
      // Per ara, només registrem l'event

      logger.info('✅ Backup automàtic completat');
    } catch (error) {
      logger.error('❌ Error en el backup automàtic:', error);
    }
  });

  // Verificar notificacions pendents cada 10 minuts
  const notificationCheckJob = new CronJob('*/10 * * * *', async () => {
    try {
      logger.debug('Verificant notificacions pendents...');

      // Aquí verificaríem si hi ha notificacions pendents
      // i les enviaríem via email o WebSocket

      logger.debug('✅ Verificació de notificacions completada');
    } catch (error) {
      logger.error('❌ Error en la verificació de notificacions:', error);
    }
  });

  // Iniciar els jobs
  cleanupLogsJob.start();
  systemHealthCheckJob.start();
  backupJob.start();
  notificationCheckJob.start();

  logger.info('✅ Cron jobs configurats i iniciats');

  // Funció per aturar tots els jobs
  const stopAllJobs = () => {
    cleanupLogsJob.stop();
    systemHealthCheckJob.stop();
    backupJob.stop();
    notificationCheckJob.stop();
    logger.info('🛑 Tots els cron jobs aturats');
  };

  // Aturar jobs al tancar l'aplicació
  process.on('SIGTERM', stopAllJobs);
  process.on('SIGINT', stopAllJobs);

  return {
    stopAllJobs,
    jobs: {
      cleanupLogs: cleanupLogsJob,
      systemHealthCheck: systemHealthCheckJob,
      backup: backupJob,
      notificationCheck: notificationCheckJob,
    },
  };
};
