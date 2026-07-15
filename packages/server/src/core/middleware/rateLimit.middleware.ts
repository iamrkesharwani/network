import rateLimit from 'express-rate-limit';
import RedisStore, { type RedisReply } from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../env/env.js';
import { FIFTEEN_MINUTES_MS } from '@network/shared';
import type { RequestHandler } from 'express';

const noopLimiter: RequestHandler = (_req, _res, next) => next();

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
): RequestHandler => {
  if (env.DISABLE_RATE_LIMIT) return noopLimiter;

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
  FIFTEEN_MINUTES_MS,
  1000,
  'Too many requests from this IP, please try again after 15 minutes.',
  'rl:api:'
);

export const authLimiter = createLimiter(
  FIFTEEN_MINUTES_MS,
  10,
  'Too many authentication attempts. Please try again after 15 minutes.',
  'rl:auth:'
);

export const otpLimiter = createLimiter(
  FIFTEEN_MINUTES_MS,
  5,
  'Too many OTP requests. Please wait 15 minutes before trying again.',
  'rl:otp:'
);

export const uploadLimiter = createLimiter(
  60 * 60 * 1000,
  30,
  'Upload limit reached. Please wait before uploading more content.',
  'rl:upload:'
);

export const webhookLimiter = createLimiter(
  60 * 1000,
  60,
  'Too many webhook requests.',
  'rl:webhook:'
);

export const searchLimiter = createLimiter(
  FIFTEEN_MINUTES_MS,
  120,
  'Too many search requests. Please wait before searching again.',
  'rl:search:'
);

export const reportLimiter = createLimiter(
  FIFTEEN_MINUTES_MS,
  30,
  'Too many reports submitted. Please wait before reporting more content.',
  'rl:report:'
);
