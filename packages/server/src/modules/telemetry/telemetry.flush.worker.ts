import { Worker } from 'bullmq';
import { TELEMETRY_FLUSH_QUEUE_NAME } from '@network/shared';
import { bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';
import { flushWatchProgressToMongo } from './telemetry.service.js';

export const startTelemetryFlushWorker = (): Worker => {
  const worker = new Worker(
    TELEMETRY_FLUSH_QUEUE_NAME,
    async () => {
      const flushed = await flushWatchProgressToMongo();
      if (flushed > 0) {
        logger.info(
          `Telemetry flush: moved ${flushed} watch-progress entries to MongoDB`
        );
      }
    },
    {
      connection: bullMqConnection,
      concurrency: 1,
    }
  );

  worker.on('failed', (job, error) => {
    logger.error(error, `Telemetry flush job failed: id=${job?.id}`);
  });

  worker.on('error', (error) => {
    logger.error(error, 'Telemetry flush worker connection error');
  });

  logger.info('Telemetry flush worker started');
  return worker;
};
