import { Worker } from 'bullmq';
import { UPLOAD_REAPER_QUEUE_NAME } from '@network/shared';
import { attachWorkerErrorBackoff, bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';
import { reapExpiredSessions } from './services/upload.reaper.service.js';

export const startUploadReaperWorker = (): Worker => {
  const worker = new Worker(
    UPLOAD_REAPER_QUEUE_NAME,
    async () => {
      const count = await reapExpiredSessions();
      if (count > 0) {
        logger.info(
          `Upload session reaper cleaned up ${count} expired session(s)`
        );
      }
    },
    {
      connection: bullMqConnection,
      concurrency: 1,
    }
  );

  worker.on('failed', (job, error) => {
    logger.error(error, `Upload session reaper job failed: id=${job?.id}`);
  });

  attachWorkerErrorBackoff(worker, 'Upload reaper');

  logger.info('Upload session reaper worker started');
  return worker;
};
