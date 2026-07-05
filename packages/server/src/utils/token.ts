import { SignJWT } from 'jose';
import { randomBytes } from 'node:crypto';
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
    .setExpirationTime('15m')
    .sign(secret);
};

export const generateRefreshToken = async (userId: string): Promise<string> => {
  const randomHex = randomBytes(40).toString('hex');
  const token = `${userId}.${randomHex}`;
  const tokenKey = `refresh_token:${userId}:${token}`;
  await redisClient.set(tokenKey, 'valid', 'EX', 604800);
  return token;
};
