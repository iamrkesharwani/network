import { Worker } from 'bullmq';
import {
  NOTIFICATION_REAPER_QUEUE_NAME,
  NOTIFICATION_RETENTION_DAYS,
} from '@network/shared';
import { ONE_DAY_MS } from '@network/shared';
import { attachWorkerErrorBackoff, bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';
import * as notificationRepository from './notification.repository.js';

export const startNotificationReaperWorker = (): Worker => {
  const worker = new Worker(
    NOTIFICATION_REAPER_QUEUE_NAME,
    async () => {
      const cutoff = new Date(
        Date.now() - NOTIFICATION_RETENTION_DAYS * ONE_DAY_MS
      );
      const deleted = await notificationRepository.deleteReadOlderThan(cutoff);

      if (deleted > 0) {
        logger.info(`Notification reaper: deleted ${deleted} read notification(s)`);
      }
    },
    {
      connection: bullMqConnection,
      concurrency: 1,
    }
  );

  worker.on('failed', (job, error) => {
    logger.error(error, `Notification reaper job failed: id=${job?.id}`);
  });

  attachWorkerErrorBackoff(worker, 'Notification reaper');

  logger.info('Notification reaper worker started');
  return worker;
};
