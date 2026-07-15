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

/**
 * A plain options object here makes BullMQ open a brand-new physical Redis
 * connection for every Queue and Worker (BullMQ only reuses a connection
 * when it's handed an actual ioredis instance - see queue-base.js's
 * `shared: isRedisInstance(opts.connection)`). With 8 queues and 8 workers
 * (2 connections each: general + blocking fetch loop), that's 27+ concurrent
 * connections, which blows through a free-tier 30-connection cap. Sharing
 * one real ioredis instance collapses every Queue's and every Worker's
 * general connection down to this single client; only each Worker's
 * dedicated blocking connection still gets its own socket, since Redis
 * blocking commands can't share a connection.
 */
export const bullMqConnection = new Redis(env.REDIS_URI_QUEUE, {
  maxRetriesPerRequest: null,
  retryStrategy: (times: number) => {
    if (times > REDIS_RECONNECT_MAX_ATTEMPTS) {
      logger.error('BullMQ Redis max retries reached. Exhausted connection attempts.');
      return null;
    }
    return Math.min(times * REDIS_RECONNECT_BACKOFF_STEP_MS, REDIS_RECONNECT_BACKOFF_CAP_MS);
  },
});

bullMqConnection.on('error', (error) => {
  logger.error(error, 'BullMQ shared Redis connection error.');
});

/**
 * BullMQ's own reconnect backoff only covers dropped connections. A rejected
 * command (e.g. Upstash's "max requests limit exceeded") is treated as a
 * non-connection error, which BullMQ retries with no delay and no cap - the
 * worker's fetch loop spins as fast as the round trip allows. This wires a
 * bounded pause/resume backoff onto that error path so it gives up instead.
 */
export const attachWorkerErrorBackoff = (worker: Worker, label: string): void => {
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
