// server/src/index.ts
import http from 'http';
import app from './app';
import config from './config';
import logger from './utils/logger';
import { initializeSocketIO } from './services/socket.service';
import { sequelize } from './database';

const server = http.createServer(app);

// Initialize socket.io
initializeSocketIO(server);

// Database synchronization (in development only)
if (config.env === 'development') {
  sequelize.sync({ alter: true }).then(() => {
    logger.info('Database synchronized');
  });
}

server.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} in ${config.env} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  // Don't crash in production, but exit in development to catch errors early
  if (config.env === 'development') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
