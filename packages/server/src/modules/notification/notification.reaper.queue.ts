import { Queue } from 'bullmq';
import {
  NOTIFICATION_REAPER_QUEUE_NAME,
  NOTIFICATION_REAPER_JOB_ID,
  NOTIFICATION_REAPER_INTERVAL_MS,
} from '@network/shared';
import { bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';

const notificationReaperQueue = new Queue(NOTIFICATION_REAPER_QUEUE_NAME, {
  connection: bullMqConnection,
});

export const scheduleNotificationReaper = async (): Promise<void> => {
  await notificationReaperQueue.add(
    'reap',
    {},
    {
      repeat: { every: NOTIFICATION_REAPER_INTERVAL_MS },
      jobId: NOTIFICATION_REAPER_JOB_ID,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  logger.info(
    `Notification reaper scheduled (every ${NOTIFICATION_REAPER_INTERVAL_MS / 3_600_000}h)`
  );
};
