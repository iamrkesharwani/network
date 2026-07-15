import { Queue } from 'bullmq';
import {
  JURY_TIMEOUT_QUEUE_NAME,
  JURY_TIMEOUT_JOB_ID,
  JURY_TIMEOUT_SWEEP_INTERVAL_MS,
} from '@network/shared';
import { bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';

const juryTimeoutQueue = new Queue(JURY_TIMEOUT_QUEUE_NAME, {
  connection: bullMqConnection,
});

export const scheduleJuryTimeoutSweep = async (): Promise<void> => {
  await juryTimeoutQueue.add(
    'sweep',
    {},
    {
      repeat: { every: JURY_TIMEOUT_SWEEP_INTERVAL_MS },
      jobId: JURY_TIMEOUT_JOB_ID,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  logger.info(
    `Jury timeout sweep scheduled (every ${JURY_TIMEOUT_SWEEP_INTERVAL_MS / 3_600_000}h)`
  );
};
