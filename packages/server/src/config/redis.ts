import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const redisOptions = {
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

redisClient.on('connect', () => {
  logger.info('Successfully connected to Redis cluster.');
});

redisClient.on('error', (err) => {
  logger.error(err, 'Redis client background error occurred.');
});
