import {
  WATCH_PROGRESS_REDIS_KEY_PREFIX,
  WATCH_PROGRESS_REDIS_TTL_SECONDS,
} from '@network/shared';
import { redisClient } from '../../core/config/redis.js';
import { WatchProgressModel } from './telemetry.model.js';

const watchProgressKey = (userId: string, videoId: string): string =>
  `${WATCH_PROGRESS_REDIS_KEY_PREFIX}${userId}:${videoId}`;

export const recordWatchProgress = async (
  userId: string,
  videoId: string,
  currentTime: number
): Promise<void> => {
  await redisClient.set(
    watchProgressKey(userId, videoId),
    currentTime.toString(),
    'EX',
    WATCH_PROGRESS_REDIS_TTL_SECONDS
  );
};

export const flushWatchProgressToMongo = async (): Promise<number> => {
  let cursor = '0';
  let flushedCount = 0;

  do {
    const [nextCursor, keys] = await redisClient.scan(
      cursor,
      'MATCH',
      `${WATCH_PROGRESS_REDIS_KEY_PREFIX}*`,
      'COUNT',
      100
    );
    cursor = nextCursor;

    for (const key of keys) {
      const [, userId, videoId] = key.split(':');
      if (!userId || !videoId) continue;

      const value = await redisClient.get(key);
      if (value === null) continue;

      const currentTime = Number(value);
      if (!Number.isFinite(currentTime)) continue;

      await WatchProgressModel.updateOne(
        { userId, videoId },
        { $set: { currentTime } },
        { upsert: true }
      );
      await redisClient.del(key);
      flushedCount += 1;
    }
  } while (cursor !== '0');

  return flushedCount;
};
