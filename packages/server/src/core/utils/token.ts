import { SignJWT } from 'jose';
import { randomBytes } from 'node:crypto';
import { ACCESS_TOKEN_EXPIRY, SEVEN_DAYS_SECONDS } from '@network/shared';
import { redisClient } from '../config/redis.js';
import { env } from '../env/env.js';

export const generateAccessToken = async (
  userId: string,
  role: string
): Promise<string> => {
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  return new SignJWT({ sub: userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secret);
};

export const generateRefreshToken = async (userId: string): Promise<string> => {
  const randomHex = randomBytes(40).toString('hex');
  const token = `${userId}.${randomHex}`;
  const tokenKey = `refresh_token:${userId}:${token}`;
  await redisClient.set(tokenKey, 'valid', 'EX', SEVEN_DAYS_SECONDS);
  return token;
};

export const revokeAllRefreshTokensForUser = async (
  userId: string
): Promise<void> => {
  const pattern = `refresh_token:${userId}:*`;
  const stream = redisClient.scanStream({ match: pattern, count: 100 });

  for await (const keys of stream as AsyncIterable<string[]>) {
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  }
};
