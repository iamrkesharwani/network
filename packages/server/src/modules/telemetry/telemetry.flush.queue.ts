import { Queue } from 'bullmq';
import {
  TELEMETRY_FLUSH_QUEUE_NAME,
  TELEMETRY_FLUSH_JOB_ID,
  TELEMETRY_FLUSH_INTERVAL_MS,
} from '@network/shared';
import { bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';

const telemetryFlushQueue = new Queue(TELEMETRY_FLUSH_QUEUE_NAME, {
  connection: bullMqConnection,
});

export const scheduleTelemetryFlush = async (): Promise<void> => {
  await telemetryFlushQueue.add(
    'flush',
    {},
    {
      repeat: { every: TELEMETRY_FLUSH_INTERVAL_MS },
      jobId: TELEMETRY_FLUSH_JOB_ID,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  logger.info(
    `Telemetry flush scheduled (every ${TELEMETRY_FLUSH_INTERVAL_MS / 60_000}m)`
  );
};
