import type { IMultipartUploadSession, UploadPart } from '@network/shared';
import {
  MULTIPART_SESSION_TTL_SECONDS,
  MULTIPART_SESSION_REAP_GRACE_SECONDS,
} from '@network/shared';
import { redisClient } from '../../core/config/redis.js';

export const multipartSessionKey = (sessionId: string): string =>
  `upload:session:${sessionId}`;

export const multipartFingerprintKey = (
  userId: string,
  fingerprint: string
): string => `upload:fingerprint:${userId}:${fingerprint}`;

export const multipartPartsKey = (sessionId: string): string =>
  `upload:session:${sessionId}:parts`;

export const multipartSessionIndexKey = 'upload:sessions:index';

const sessionKeyTtlSeconds =
  MULTIPART_SESSION_TTL_SECONDS + MULTIPART_SESSION_REAP_GRACE_SECONDS;

const indexScore = (): number =>
  Date.now() + MULTIPART_SESSION_TTL_SECONDS * 1000;

const serializeMetadata = (session: IMultipartUploadSession): string => {
  const { parts: _parts, ...metadata } = session;
  return JSON.stringify(metadata);
};

export const createSession = async (
  session: IMultipartUploadSession
): Promise<void> => {
  await Promise.all([
    redisClient.set(
      multipartSessionKey(session.sessionId),
      serializeMetadata(session),
      'EX',
      sessionKeyTtlSeconds
    ),
    redisClient.set(
      multipartFingerprintKey(session.userId, session.fingerprint),
      session.sessionId,
      'EX',
      MULTIPART_SESSION_TTL_SECONDS
    ),
    redisClient.zadd(multipartSessionIndexKey, indexScore(), session.sessionId),
  ]);
};

export const getSession = async (
  sessionId: string
): Promise<IMultipartUploadSession | null> => {
  const [raw, partsMap] = await Promise.all([
    redisClient.get(multipartSessionKey(sessionId)),
    redisClient.hgetall(multipartPartsKey(sessionId)),
  ]);
  if (!raw) return null;

  const metadata = JSON.parse(raw) as Omit<IMultipartUploadSession, 'parts'>;
  const parts = Object.values(partsMap ?? {})
    .map((value) => JSON.parse(value) as UploadPart)
    .sort((a, b) => a.partNumber - b.partNumber);

  return { ...metadata, parts };
};

export const findSessionByFingerprint = async (
  userId: string,
  fingerprint: string
): Promise<string | null> => {
  return redisClient.get(multipartFingerprintKey(userId, fingerprint));
};

export const addCompletedPart = async (
  sessionId: string,
  part: UploadPart
): Promise<void> => {
  const metadataKey = multipartSessionKey(sessionId);
  const exists = await redisClient.exists(metadataKey);
  if (!exists) return;

  const partsKey = multipartPartsKey(sessionId);
  await redisClient
    .multi()
    .hset(partsKey, String(part.partNumber), JSON.stringify(part))
    .expire(partsKey, sessionKeyTtlSeconds)
    .exec();
};

export const deleteSession = async (
  sessionId: string,
  userId: string,
  fingerprint: string
): Promise<void> => {
  await Promise.all([
    redisClient.del(multipartSessionKey(sessionId)),
    redisClient.del(multipartPartsKey(sessionId)),
    redisClient.del(multipartFingerprintKey(userId, fingerprint)),
    redisClient.zrem(multipartSessionIndexKey, sessionId),
  ]);
};

export const getExpiredSessionIds = async (): Promise<string[]> => {
  return redisClient.zrangebyscore(multipartSessionIndexKey, 0, Date.now());
};

export const removeFromIndex = async (sessionId: string): Promise<void> => {
  await redisClient.zrem(multipartSessionIndexKey, sessionId);
};
