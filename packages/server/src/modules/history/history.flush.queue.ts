import { Queue } from 'bullmq';
import {
  HISTORY_FLUSH_QUEUE_NAME,
  HISTORY_FLUSH_JOB_ID,
  HISTORY_FLUSH_INTERVAL_MS,
} from '@network/shared';
import { bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';

const historyFlushQueue = new Queue(HISTORY_FLUSH_QUEUE_NAME, {
  connection: bullMqConnection,
});

export const scheduleHistoryFlush = async (): Promise<void> => {
  await historyFlushQueue.add(
    'flush',
    {},
    {
      repeat: { every: HISTORY_FLUSH_INTERVAL_MS },
      jobId: HISTORY_FLUSH_JOB_ID,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  logger.info(
    `History flush scheduled (every ${HISTORY_FLUSH_INTERVAL_MS / 60_000}m)`
  );
};
