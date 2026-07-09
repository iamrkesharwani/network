import { Queue } from 'bullmq';
import { bullMqConnection } from '../../email/connection.js';
import { logger } from '../../utils/logger.js';

export const UPLOAD_REAPER_QUEUE_NAME = 'upload-session-reaper';
const UPLOAD_REAPER_JOB_ID = 'upload-session-reaper';
const UPLOAD_REAPER_INTERVAL_MS = 15 * 60 * 1000;

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
