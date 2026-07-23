import { Worker } from 'bullmq';
import { MESSAGE_ATTACHMENT_REAPER_QUEUE_NAME } from '@network/shared';
import { attachWorkerErrorBackoff, bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';
import { reapExpiredPendingAttachments } from './services/messageAttachment.service.js';

export const startMessageAttachmentReaperWorker = (): Worker => {
  const worker = new Worker(
    MESSAGE_ATTACHMENT_REAPER_QUEUE_NAME,
    async () => {
      const count = await reapExpiredPendingAttachments();
      if (count > 0) {
        logger.info(
          `Message attachment reaper cleaned up ${count} orphaned upload(s)`
        );
      }
    },
    {
      connection: bullMqConnection,
      concurrency: 1,
    }
  );

  worker.on('failed', (job, error) => {
    logger.error(error, `Message attachment reaper job failed: id=${job?.id}`);
  });

  attachWorkerErrorBackoff(worker, 'Message attachment reaper');

  logger.info('Message attachment reaper worker started');
  return worker;
};
