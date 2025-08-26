import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { authMiddleware } from './middleware/auth';
import { activityLogger } from './middleware/activityLogger';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import centreRoutes from './routes/centres';
import cursRoutes from './routes/cursos';
import assignaturaRoutes from './routes/assignatures';
import professorRoutes from './routes/professors';
import alumneRoutes from './routes/alumnes';
import rubricaRoutes from './routes/rubriques';
import avaluacioRoutes from './routes/avaluacions';
import configuracioRoutes from './routes/configuracions';
import integracioRoutes from './routes/integracions';
import notificationRoutes from './routes/notifications';
import dashboardRoutes from './routes/dashboard';
import n8nRoutes from './routes/n8n';
import backupRoutes from './routes/backups';

// Services
import { setupWebSocketHandlers } from './services/websocket';
import { setupCronJobs } from './services/cron';
import { setupEmailService } from './services/email';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:2705',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize Prisma
export const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:2705',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Massa peticions des d\'aquesta IP, si us plau, torna-ho a provar més tard.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Activity logging middleware
app.use(activityLogger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/centres', authMiddleware, centreRoutes);
app.use('/api/cursos', authMiddleware, cursRoutes);
app.use('/api/assignatures', authMiddleware, assignaturaRoutes);
app.use('/api/professors', authMiddleware, professorRoutes);
app.use('/api/alumnes', authMiddleware, alumneRoutes);
app.use('/api/rubriques', authMiddleware, rubricaRoutes);
app.use('/api/avaluacions', authMiddleware, avaluacioRoutes);
app.use('/api/configuracions', authMiddleware, configuracioRoutes);
app.use('/api/integracions', authMiddleware, integracioRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/n8n', authMiddleware, n8nRoutes);
app.use('/api/backups', authMiddleware, backupRoutes);

// WebSocket setup
setupWebSocketHandlers(io);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
});

// Initialize services
async function initializeServices() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connection established');

    // Setup email service
    await setupEmailService();
    logger.info('✅ Email service initialized');

    // Setup cron jobs
    setupCronJobs();
    logger.info('✅ Cron jobs initialized');

    // Start server
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}/api`);
      logger.info(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    logger.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Initialize the application
initializeServices();
