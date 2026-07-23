import { Queue } from 'bullmq';
import {
  MESSAGE_ATTACHMENT_REAPER_QUEUE_NAME,
  MESSAGE_ATTACHMENT_REAPER_JOB_ID,
  MESSAGE_ATTACHMENT_REAPER_INTERVAL_MS,
} from '@network/shared';
import { bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';

const messageAttachmentReaperQueue = new Queue(
  MESSAGE_ATTACHMENT_REAPER_QUEUE_NAME,
  { connection: bullMqConnection }
);

export const scheduleMessageAttachmentReaper = async (): Promise<void> => {
  await messageAttachmentReaperQueue.add(
    'reap',
    {},
    {
      repeat: { every: MESSAGE_ATTACHMENT_REAPER_INTERVAL_MS },
      jobId: MESSAGE_ATTACHMENT_REAPER_JOB_ID,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  logger.info(
    `Message attachment reaper scheduled (every ${MESSAGE_ATTACHMENT_REAPER_INTERVAL_MS / 60000}min)`
  );
};
