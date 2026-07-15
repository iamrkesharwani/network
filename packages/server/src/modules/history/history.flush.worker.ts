import { Worker } from 'bullmq';
import { HISTORY_FLUSH_QUEUE_NAME } from '@network/shared';
import { attachWorkerErrorBackoff, bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';
import { flushBufferedProgressToMongo } from './services/history.progress.service.js';

export const startHistoryFlushWorker = (): Worker => {
  const worker = new Worker(
    HISTORY_FLUSH_QUEUE_NAME,
    async () => {
      const flushed = await flushBufferedProgressToMongo();
      if (flushed > 0) {
        logger.info(
          `History flush: moved ${flushed} watch-progress entries to MongoDB`
        );
      }
    },
    {
      connection: bullMqConnection,
      concurrency: 1,
    }
  );

  worker.on('failed', (job, error) => {
    logger.error(error, `History flush job failed: id=${job?.id}`);
  });

  attachWorkerErrorBackoff(worker, 'History flush');

  logger.info('History flush worker started');
  return worker;
};
