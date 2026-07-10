import { Queue } from 'bullmq';
import {
  UPLOAD_REAPER_QUEUE_NAME,
  UPLOAD_REAPER_JOB_ID,
  UPLOAD_REAPER_INTERVAL_MS,
} from '@network/shared';
import { bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';

const uploadReaperQueue = new Queue(UPLOAD_REAPER_QUEUE_NAME, {
  connection: bullMqConnection,
});

export const scheduleUploadSessionReaper = async (): Promise<void> => {
  await uploadReaperQueue.add(
    'reap',
    {},
    {
      repeat: { every: UPLOAD_REAPER_INTERVAL_MS },
      jobId: UPLOAD_REAPER_JOB_ID,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  logger.info(
    `Upload session reaper scheduled (every ${UPLOAD_REAPER_INTERVAL_MS / 60000}min)`
  );
};
