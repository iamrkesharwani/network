import { Worker } from 'bullmq';
import { CONTENT_REAPER_QUEUE_NAME } from '@network/shared';
import { bullMqConnection } from '../config/bullmq.js';
import { logger } from '../utils/logger.js';
import { getContentReaperAdapters } from './contentReaper.registry.js';

export const startContentReaperWorker = (): Worker => {
  const worker = new Worker(
    CONTENT_REAPER_QUEUE_NAME,
    async () => {
      for (const adapter of getContentReaperAdapters()) {
        const [reaped, expired, warned] = await Promise.all([
          adapter.reapExpiredSoftDeletes(),
          adapter.expireUnlistedContent(),
          adapter.warnExpiringUnlisted(),
        ]);

        if (reaped > 0 || expired > 0 || warned > 0) {
          logger.info(
            `Content reaper (${adapter.contentType}): hard-deleted=${reaped} unlisted-expired=${expired} warned=${warned}`
          );
        }
      }
    },
    {
      connection: bullMqConnection,
      concurrency: 1,
    }
  );

  worker.on('failed', (job, error) => {
    logger.error(error, `Content reaper job failed: id=${job?.id}`);
  });

  worker.on('error', (error) => {
    logger.error(error, 'Content reaper worker connection error');
  });

  logger.info('Content reaper worker started');
  return worker;
};
