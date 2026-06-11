import 'dotenv/config';
import { createServer } from 'node:http';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDb } from './config/db.js';
import { initRedis } from './config/redis.js';
import { initSocket } from './config/socket.js';
import { logger } from './utils/logger.js';
import { env } from './config/env.js';

const port = env.PORT;
const httpServer = createServer(app);

const startServer = async () => {
  try {
    await connectDb();
    await initRedis();
    initSocket(httpServer);

    httpServer.listen(port, '0.0.0.0', () => {
      logger.info(`Server listening on port ${port}`);
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

    logger.info(
      'HTTP server closed cleanly. Terminating database connections...'
    );
    try {
      await mongoose.disconnect();
      logger.info('MongoDB connection pool disconnected successfully.');
      process.exit(0);
    } catch (dbError) {
      logger.error(dbError, 'Error during database disconnection sequence');
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error(
      'Forced shutdown invoked due to operational execution timeout.'
    );
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
