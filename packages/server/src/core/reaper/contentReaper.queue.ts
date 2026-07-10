import { Queue } from 'bullmq';
import {
  CONTENT_REAPER_QUEUE_NAME,
  CONTENT_REAPER_JOB_ID,
  CONTENT_REAPER_INTERVAL_MS,
} from '@network/shared';
import { bullMqConnection } from '../config/bullmq.js';
import { logger } from '../utils/logger.js';

const contentReaperQueue = new Queue(CONTENT_REAPER_QUEUE_NAME, {
  connection: bullMqConnection,
});

export const scheduleContentReaper = async (): Promise<void> => {
  await contentReaperQueue.add(
    'reap',
    {},
    {
      repeat: { every: CONTENT_REAPER_INTERVAL_MS },
      jobId: CONTENT_REAPER_JOB_ID,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  logger.info(
    `Content reaper scheduled (every ${CONTENT_REAPER_INTERVAL_MS / 3_600_000}h)`
  );
};
