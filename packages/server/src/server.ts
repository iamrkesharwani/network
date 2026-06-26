import 'dotenv/config';
import { createServer } from 'node:http';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDb } from './config/db.js';
import {
  initRedis,
  redisClient,
  pubClient,
  subClient,
} from './config/redis.js';
import { initSocket } from './config/socket.js';
import { logger } from './utils/logger.js';
import { env } from './config/env.js';
import { startEmailWorker } from './email/email.js';

const port = env.PORT;
const httpServer = createServer(app);

const startServer = async () => {
  try {
    await connectDb();
    await initRedis();
    initSocket(httpServer);
    startEmailWorker();

    httpServer.listen(port, '0.0.0.0', () => {
      logger.info(`Server listening on port ${port}`);
      logger.info(
        `Providers:
        storage: ${env.STORAGE_PROVIDER}
        video: ${env.VIDEO_PROVIDER}
        image: ${env.IMAGE_PROVIDER}`
      );
    });
  } catch (error) {
    logger.error(error, 'Failed to initialize application startup');
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  logger.warn(`Received ${signal}. Starting graceful shutdown sequence...`);

  httpServer.close(async (err) => {
    if (err) {
      logger.error(err, 'Error occurred while closing HTTP server');
      process.exit(1);
    }

    logger.info('HTTP server closed cleanly. Terminating all connections...');

    try {
      await Promise.all([
        mongoose.disconnect(),
        redisClient.quit(),
        pubClient.quit(),
        subClient.quit(),
      ]);
      logger.info('All connections closed successfully.');
      process.exit(0);
    } catch (shutdownError) {
      logger.error(shutdownError, 'Error during connection teardown');
      process.exit(1);
    }
  });

  const FORCE_SHUTDOWN_TIME = 10000;
  setTimeout(() => {
    logger.error(
      'Forced shutdown invoked due to operational execution timeout.'
    );
    process.exit(1);
  }, FORCE_SHUTDOWN_TIME);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
