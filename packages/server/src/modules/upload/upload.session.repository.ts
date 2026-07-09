import type { IMultipartUploadSession, UploadPart } from '@network/shared';
import {
  MULTIPART_SESSION_TTL_SECONDS,
  MULTIPART_SESSION_REAP_GRACE_SECONDS,
} from '@network/shared';
import { redisClient } from '../../config/redis.js';

export const multipartSessionKey = (sessionId: string): string =>
  `upload:session:${sessionId}`;

export const multipartFingerprintKey = (
  userId: string,
  fingerprint: string
): string => `upload:fingerprint:${userId}:${fingerprint}`;

export const multipartSessionIndexKey = 'upload:sessions:index';

// The session hash is kept alive slightly past its logical TTL so the
// reaper can still read it (mediaId, storageKey, etc.) to clean up the
// provider-side multipart upload and the DB placeholder before it's gone.
const sessionKeyTtlSeconds =
  MULTIPART_SESSION_TTL_SECONDS + MULTIPART_SESSION_REAP_GRACE_SECONDS;

const indexScore = (): number =>
  Date.now() + MULTIPART_SESSION_TTL_SECONDS * 1000;

export const createSession = async (
  session: IMultipartUploadSession
): Promise<void> => {
  await Promise.all([
    redisClient.set(
      multipartSessionKey(session.sessionId),
      JSON.stringify(session),
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
  const raw = await redisClient.get(multipartSessionKey(sessionId));
  if (!raw) return null;
  return JSON.parse(raw) as IMultipartUploadSession;
};

export const findSessionByFingerprint = async (
  userId: string,
  fingerprint: string
): Promise<string | null> => {
  return redisClient.get(multipartFingerprintKey(userId, fingerprint));
};

export const saveSession = async (
  session: IMultipartUploadSession
): Promise<void> => {
  await Promise.all([
    redisClient.set(
      multipartSessionKey(session.sessionId),
      JSON.stringify(session),
      'EX',
      sessionKeyTtlSeconds
    ),
    redisClient.expire(
      multipartFingerprintKey(session.userId, session.fingerprint),
      MULTIPART_SESSION_TTL_SECONDS
    ),
    redisClient.zadd(multipartSessionIndexKey, indexScore(), session.sessionId),
  ]);
};

export const addCompletedPart = async (
  sessionId: string,
  part: UploadPart
): Promise<IMultipartUploadSession | null> => {
  const session = await getSession(sessionId);
  if (!session) return null;

  const existingIndex = session.parts.findIndex(
    (p) => p.partNumber === part.partNumber
  );

  if (existingIndex >= 0) {
    session.parts[existingIndex] = part;
  } else {
    session.parts.push(part);
  }

  await saveSession(session);
  return session;
};

export const deleteSession = async (
  sessionId: string,
  userId: string,
  fingerprint: string
): Promise<void> => {
  await Promise.all([
    redisClient.del(multipartSessionKey(sessionId)),
    redisClient.del(multipartFingerprintKey(userId, fingerprint)),
    redisClient.zrem(multipartSessionIndexKey, sessionId),
  ]);
};

// Session ids whose logical TTL has passed. The underlying hash may still
// exist (see sessionKeyTtlSeconds grace period) so callers can inspect it
// before it's evicted by Redis.
export const getExpiredSessionIds = async (): Promise<string[]> => {
  return redisClient.zrangebyscore(multipartSessionIndexKey, 0, Date.now());
};

export const removeFromIndex = async (sessionId: string): Promise<void> => {
  await redisClient.zrem(multipartSessionIndexKey, sessionId);
};
