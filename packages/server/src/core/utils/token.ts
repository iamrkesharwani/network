import { SignJWT } from 'jose';
import { randomBytes, createHash } from 'node:crypto';
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

interface ParsedRefreshToken {
  userId: string;
  secret: string;
}

const parseRefreshToken = (token: string): ParsedRefreshToken | null => {
  const separatorIndex = token.indexOf('.');
  if (separatorIndex === -1) return null;

  const userId = token.slice(0, separatorIndex);
  const secret = token.slice(separatorIndex + 1);
  if (!userId || !secret) return null;

  return { userId, secret };
};

const hashRefreshTokenSecret = (secret: string): string =>
  createHash('sha256').update(secret).digest('hex');

const buildRefreshTokenKey = (userId: string, secret: string): string =>
  `refresh_token:${userId}:${hashRefreshTokenSecret(secret)}`;

const REFRESH_TOKEN_ACTIVE_MARKER = 'active';
const REFRESH_TOKEN_ROTATED_MARKER = 'rotated';

export const generateRefreshToken = async (userId: string): Promise<string> => {
  const randomHex = randomBytes(40).toString('hex');
  const token = `${userId}.${randomHex}`;
  await redisClient.set(
    buildRefreshTokenKey(userId, randomHex),
    REFRESH_TOKEN_ACTIVE_MARKER,
    'EX',
    SEVEN_DAYS_SECONDS
  );
  return token;
};

export type RefreshTokenConsumeResult =
  | { outcome: 'consumed'; userId: string }
  | { outcome: 'reused'; userId: string }
  | { outcome: 'invalid' };

export const validateAndConsumeRefreshToken = async (
  token: string
): Promise<RefreshTokenConsumeResult> => {
  const parsed = parseRefreshToken(token);
  if (!parsed) return { outcome: 'invalid' };

  const key = buildRefreshTokenKey(parsed.userId, parsed.secret);
  const storedMarker = await redisClient.get(key);

  if (storedMarker === REFRESH_TOKEN_ROTATED_MARKER) {
    return { outcome: 'reused', userId: parsed.userId };
  }

  if (storedMarker !== REFRESH_TOKEN_ACTIVE_MARKER) {
    return { outcome: 'invalid' };
  }

  await redisClient.set(key, REFRESH_TOKEN_ROTATED_MARKER, 'KEEPTTL');
  return { outcome: 'consumed', userId: parsed.userId };
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  const parsed = parseRefreshToken(token);
  if (!parsed) return;

  await redisClient.del(buildRefreshTokenKey(parsed.userId, parsed.secret));
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

export const revokeAllRefreshTokensForUserExcept = async (
  userId: string,
  tokenToKeep: string
): Promise<void> => {
  const parsed = parseRefreshToken(tokenToKeep);
  const keyToKeep = parsed
    ? buildRefreshTokenKey(parsed.userId, parsed.secret)
    : null;

  const pattern = `refresh_token:${userId}:*`;
  const stream = redisClient.scanStream({ match: pattern, count: 100 });

  for await (const keys of stream as AsyncIterable<string[]>) {
    const keysToDelete = keys.filter((key) => key !== keyToKeep);
    if (keysToDelete.length > 0) {
      await redisClient.del(...keysToDelete);
    }
  }
};
