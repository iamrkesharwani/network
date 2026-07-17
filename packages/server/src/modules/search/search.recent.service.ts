import { RECENT_SEARCHES_MAX } from '@network/shared';
import { redisClient } from '../../core/config/redis.js';

const recentSearchesKey = (userId: string): string =>
  `recent-searches:${userId}`;

export const getRecentSearches = (userId: string): Promise<string[]> =>
  redisClient.lrange(recentSearchesKey(userId), 0, RECENT_SEARCHES_MAX - 1);

export const addRecentSearch = async (
  userId: string,
  query: string
): Promise<string[]> => {
  const trimmed = query.trim();
  if (!trimmed) return getRecentSearches(userId);

  const key = recentSearchesKey(userId);
  const current = await redisClient.lrange(key, 0, -1);
  const deduped = current.filter(
    (existing) => existing.toLowerCase() !== trimmed.toLowerCase()
  );
  const next = [trimmed, ...deduped].slice(0, RECENT_SEARCHES_MAX);

  const pipeline = redisClient.multi().del(key);
  if (next.length > 0) pipeline.rpush(key, ...next);
  await pipeline.exec();

  return next;
};

export const removeRecentSearch = async (
  userId: string,
  query: string
): Promise<string[]> => {
  await redisClient.lrem(recentSearchesKey(userId), 0, query);
  return getRecentSearches(userId);
};

export const clearRecentSearches = async (userId: string): Promise<void> => {
  await redisClient.del(recentSearchesKey(userId));
};
