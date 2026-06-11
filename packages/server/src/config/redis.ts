import { Redis, type RedisOptions } from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const redisOptions: RedisOptions = {
  lazyConnect: true,
  retryStrategy: (times: number) => {
    if (times > 10) {
      logger.error('Redis max retries reached. Exhausted connection attempts.');
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null,
};

export const redisClient = new Redis(env.REDIS_URI, redisOptions);
export const pubClient = new Redis(env.REDIS_URI, redisOptions);
export const subClient = new Redis(env.REDIS_URI, redisOptions);

redisClient.on('error', (err) => {
  logger.error(err, 'Redis client background error occurred.');
});

export const initRedis = async () => {
  try {
    await Promise.all([
      redisClient.connect(),
      pubClient.connect(),
      subClient.connect(),
    ]);
    logger.info('Successfully connected to Redis cluster.');
  } catch (error) {
    logger.error(error, 'Failed to connect to Redis during startup');
    throw error;
  }
};
