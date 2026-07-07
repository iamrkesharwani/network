import type { IMultipartUploadSession, UploadPart } from '@network/shared';
import { MULTIPART_SESSION_TTL_SECONDS } from '@network/shared';
import { redisClient } from '../../config/redis.js';

export const multipartSessionKey = (sessionId: string): string =>
  `upload:session:${sessionId}`;

export const multipartFingerprintKey = (
  userId: string,
  fingerprint: string
): string => `upload:fingerprint:${userId}:${fingerprint}`;

export const createSession = async (
  session: IMultipartUploadSession
): Promise<void> => {
  await Promise.all([
    redisClient.set(
      multipartSessionKey(session.sessionId),
      JSON.stringify(session),
      'EX',
      MULTIPART_SESSION_TTL_SECONDS
    ),
    redisClient.set(
      multipartFingerprintKey(session.userId, session.fingerprint),
      session.sessionId,
      'EX',
      MULTIPART_SESSION_TTL_SECONDS
    ),
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
      MULTIPART_SESSION_TTL_SECONDS
    ),
    redisClient.expire(
      multipartFingerprintKey(session.userId, session.fingerprint),
      MULTIPART_SESSION_TTL_SECONDS
    ),
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
  ]);
};
