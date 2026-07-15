import { Redis, type RedisOptions } from 'ioredis';
import {
  REDIS_RECONNECT_MAX_ATTEMPTS,
  REDIS_RECONNECT_BACKOFF_STEP_MS,
  REDIS_RECONNECT_BACKOFF_CAP_MS,
} from '@network/shared';
import { env } from '../env/env.js';
import { logger } from '../utils/logger.js';

const redisOptions: RedisOptions = {
  lazyConnect: true,
  retryStrategy: (times: number) => {
    if (times > REDIS_RECONNECT_MAX_ATTEMPTS) {
      logger.error('Redis max retries reached. Exhausted connection attempts.');
      return null;
    }
    return Math.min(times * REDIS_RECONNECT_BACKOFF_STEP_MS, REDIS_RECONNECT_BACKOFF_CAP_MS);
  },
  maxRetriesPerRequest: null,
};

export const redisClient = new Redis(env.REDIS_URI_CORE, redisOptions);
export const pubClient = new Redis(env.REDIS_URI_SOCKET, redisOptions);
export const subClient = new Redis(env.REDIS_URI_SOCKET, redisOptions);

redisClient.on('error', (err) => {
  logger.error(err, 'Redis client background error occurred.');
});

export const initRedis = async () => {
  try {
    const connectClient = async (client: Redis) => {
      if (client.status === 'wait') {
        await client.connect();
      }
    };

    await Promise.all([
      connectClient(redisClient),
      connectClient(pubClient),
      connectClient(subClient),
    ]);
    logger.info('Successfully connected to Redis cluster.');
  } catch (error) {
    logger.error(error, 'Failed to connect to Redis during startup');
    throw error;
  }
};
