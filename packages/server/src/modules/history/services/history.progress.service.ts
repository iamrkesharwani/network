import {
  HISTORY_PROGRESS_REDIS_KEY_PREFIX,
  HISTORY_PROGRESS_REDIS_TTL_SECONDS,
  type HistoryContentType,
} from '@network/shared';
import { redisClient } from '../../../core/config/redis.js';
import * as historyRepository from '../history.repository.js';

interface BufferedProgress {
  currentTime: number;
  duration?: number;
}

const progressKey = (
  userId: string,
  contentType: HistoryContentType,
  contentId: string
): string => `${HISTORY_PROGRESS_REDIS_KEY_PREFIX}${userId}:${contentType}:${contentId}`;

export const bufferProgress = async (
  userId: string,
  contentType: HistoryContentType,
  contentId: string,
  currentTime: number,
  duration?: number
): Promise<void> => {
  const payload: BufferedProgress = {
    currentTime,
    ...(duration !== undefined && { duration }),
  };

  await redisClient.set(
    progressKey(userId, contentType, contentId),
    JSON.stringify(payload),
    'EX',
    HISTORY_PROGRESS_REDIS_TTL_SECONDS
  );
};

export const flushBufferedProgressToMongo = async (): Promise<number> => {
  let cursor = '0';
  let flushedCount = 0;

  do {
    const [nextCursor, keys] = await redisClient.scan(
      cursor,
      'MATCH',
      `${HISTORY_PROGRESS_REDIS_KEY_PREFIX}*`,
      'COUNT',
      100
    );
    cursor = nextCursor;

    for (const key of keys) {
      const [, userId, contentType, contentId] = key.split(':');
      if (!userId || !contentType || !contentId) continue;

      const value = await redisClient.get(key);
      if (value === null) continue;

      const parsed = JSON.parse(value) as BufferedProgress;
      if (!Number.isFinite(parsed.currentTime)) continue;

      await historyRepository.upsertProgress(
        userId,
        contentType as HistoryContentType,
        contentId,
        parsed.currentTime,
        parsed.duration
      );
      await redisClient.del(key);
      flushedCount += 1;
    }
  } while (cursor !== '0');

  return flushedCount;
};
