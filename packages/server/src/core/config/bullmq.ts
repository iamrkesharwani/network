import { Redis } from 'ioredis';
import type { Worker } from 'bullmq';
import {
  REDIS_RECONNECT_MAX_ATTEMPTS,
  REDIS_RECONNECT_BACKOFF_STEP_MS,
  REDIS_RECONNECT_BACKOFF_CAP_MS,
  BULLMQ_WORKER_ERROR_MAX_ATTEMPTS,
  BULLMQ_WORKER_ERROR_BACKOFF_STEP_MS,
  BULLMQ_WORKER_ERROR_BACKOFF_CAP_MS,
} from '@network/shared';
import { env } from '../env/env.js';
import { logger } from '../utils/logger.js';

export const bullMqConnection = new Redis(env.REDIS_URI_QUEUE, {
  maxRetriesPerRequest: null,
  retryStrategy: (times: number) => {
    if (times > REDIS_RECONNECT_MAX_ATTEMPTS) {
      logger.error(
        'BullMQ Redis max retries reached. Exhausted connection attempts.'
      );
      return null;
    }
    return Math.min(
      times * REDIS_RECONNECT_BACKOFF_STEP_MS,
      REDIS_RECONNECT_BACKOFF_CAP_MS
    );
  },
});

bullMqConnection.on('error', (error) => {
  logger.error(error, 'BullMQ shared Redis connection error.');
});

export const attachWorkerErrorBackoff = (
  worker: Worker,
  label: string
): void => {
  let consecutiveErrors = 0;
  let backoffTimer: NodeJS.Timeout | undefined;

  worker.on('active', () => {
    consecutiveErrors = 0;
  });

  worker.on('error', (error) => {
    logger.error(error, `${label} worker connection error`);

    if (backoffTimer) return;

    consecutiveErrors += 1;

    if (consecutiveErrors > BULLMQ_WORKER_ERROR_MAX_ATTEMPTS) {
      logger.error(
        `${label} worker: exhausted ${BULLMQ_WORKER_ERROR_MAX_ATTEMPTS} retry attempts, pausing until process restart`
      );
      void worker.pause(true);
      return;
    }

    const delay = Math.min(
      consecutiveErrors * BULLMQ_WORKER_ERROR_BACKOFF_STEP_MS,
      BULLMQ_WORKER_ERROR_BACKOFF_CAP_MS
    );

    void worker.pause(true);
    backoffTimer = setTimeout(() => {
      backoffTimer = undefined;
      void worker.resume();
    }, delay);
  });
};
