import { Queue } from 'bullmq';
import {
  TRUST_DECAY_QUEUE_NAME,
  TRUST_DECAY_JOB_ID,
  TRUST_DECAY_INTERVAL_MS,
} from '@network/shared';
import { bullMqConnection } from '../config/bullmq.js';
import { logger } from '../utils/logger.js';

const trustDecayQueue = new Queue(TRUST_DECAY_QUEUE_NAME, {
  connection: bullMqConnection,
});

export const scheduleTrustDecay = async (): Promise<void> => {
  await trustDecayQueue.add(
    'decay',
    {},
    {
      repeat: { every: TRUST_DECAY_INTERVAL_MS },
      jobId: TRUST_DECAY_JOB_ID,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  logger.info(
    `Trust decay sweep scheduled (every ${TRUST_DECAY_INTERVAL_MS / 86_400_000}d)`
  );
};
