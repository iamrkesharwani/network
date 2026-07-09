import { Worker } from 'bullmq';
import { bullMqConnection } from '../../email/connection.js';
import { logger } from '../../utils/logger.js';
import { UPLOAD_REAPER_QUEUE_NAME } from './upload.reaper.queue.js';
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

  worker.on('error', (error) => {
    logger.error(error, 'Upload reaper worker connection error');
  });

  logger.info('Upload session reaper worker started');
  return worker;
};
