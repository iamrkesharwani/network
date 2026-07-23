import { MESSAGE_ATTACHMENT_UPLOAD_TTL_SECONDS } from '@network/shared';
import { redisClient } from '../../../core/config/redis.js';

export const pendingAttachmentKey = (storageKey: string): string =>
  `message-attachment:pending:${storageKey}`;

export const pendingAttachmentIndexKey = 'message-attachment:pending:index';

const indexScore = (): number =>
  Date.now() + MESSAGE_ATTACHMENT_UPLOAD_TTL_SECONDS * 1000;

export const createPendingAttachment = async (
  storageKey: string,
  userId: string
): Promise<void> => {
  await Promise.all([
    redisClient.set(
      pendingAttachmentKey(storageKey),
      userId,
      'EX',
      MESSAGE_ATTACHMENT_UPLOAD_TTL_SECONDS
    ),
    redisClient.zadd(pendingAttachmentIndexKey, indexScore(), storageKey),
  ]);
};

export const getPendingAttachmentOwner = (
  storageKey: string
): Promise<string | null> => redisClient.get(pendingAttachmentKey(storageKey));

export const confirmPendingAttachment = async (
  storageKey: string
): Promise<void> => {
  await Promise.all([
    redisClient.del(pendingAttachmentKey(storageKey)),
    redisClient.zrem(pendingAttachmentIndexKey, storageKey),
  ]);
};

export const getExpiredPendingStorageKeys = (): Promise<string[]> =>
  redisClient.zrangebyscore(pendingAttachmentIndexKey, 0, Date.now());

export const removeFromPendingIndex = async (
  storageKey: string
): Promise<void> => {
  await redisClient.zrem(pendingAttachmentIndexKey, storageKey);
};
