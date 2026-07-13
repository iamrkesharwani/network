import 'dotenv/config';
import { createServer } from 'node:http';
import mongoose from 'mongoose';
import { HEALTH_CHECK_ROUTE, METRICS_ROUTE } from '@network/shared';
import { connectDb } from './core/config/db.js';
import './modules/user/user.model.js';
import {
  initRedis,
  redisClient,
  pubClient,
  subClient,
} from './core/config/redis.js';
import { initSocket } from './core/config/socket.js';
import { logger } from './core/utils/logger.js';
import { env } from './core/env/env.js';
import { register } from './core/metrics/queueMetrics.js';
import { startMediaIngestWorker } from './modules/upload/upload.ingest.worker.js';
import { startQueueBacklogMonitor } from './modules/upload/upload.ingest.monitor.js';

const port = env.WORKER_PORT;
let backlogMonitor: NodeJS.Timeout | undefined;

const httpServer = createServer((req, res) => {
  if (req.url === HEALTH_CHECK_ROUTE) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  if (req.url === METRICS_ROUTE) {
    register
      .metrics()
      .then((metrics) => {
        res.writeHead(200, { 'Content-Type': register.contentType });
        res.end(metrics);
      })
      .catch((error) => {
        logger.error(error, 'Failed to render Prometheus metrics');
        res.writeHead(500);
        res.end();
      });
    return;
  }

  res.writeHead(404);
  res.end();
});

const startWorker = async () => {
  try {
    await connectDb();
    await initRedis();
    initSocket(httpServer);
    startMediaIngestWorker();
    backlogMonitor = startQueueBacklogMonitor();

    httpServer.listen(port, '0.0.0.0', () => {
      logger.info(`Worker health check listening on port ${port}`);
      logger.info(`Providers:\n        video: ${env.VIDEO_PROVIDER}`);
    });
  } catch (error) {
    logger.error(error, 'Failed to initialize worker process startup');
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  logger.warn(`Received ${signal}. Starting graceful shutdown sequence...`);

  if (backlogMonitor) clearInterval(backlogMonitor);

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

startWorker();
