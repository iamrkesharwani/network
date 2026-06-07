import rateLimit from 'express-rate-limit';
import RedisStore, { type RedisReply } from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';
import { ApiError } from '../utils/ApiError.js';

const createStore = (prefix: string) =>
  new RedisStore({
    prefix,
    sendCommand: (...args: [string, ...string[]]) =>
      redisClient.call(args[0], ...args.slice(1)) as Promise<RedisReply>,
  });

const createLimiter = (
  windowMs: number,
  max: number,
  message: string,
  prefix: string
) => {
  return rateLimit({
    store: createStore(prefix),
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new ApiError(429, 'RATE_LIMIT_EXCEEDED', message));
    },
  });
};

export const apiLimiter = createLimiter(
  15 * 60 * 1000,
  1000,
  'Too many requests from this IP, please try again after 15 minutes.',
  'rl:api:'
);

export const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many authentication attempts. Please try again after 15 minutes.',
  'rl:auth:'
);

export const uploadLimiter = createLimiter(
  60 * 60 * 1000,
  30,
  'Upload limit reached. Please wait before uploading more content.',
  'rl:upload:'
);
