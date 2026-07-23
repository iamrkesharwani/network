import { MESSAGE_COLD_OUTREACH_WINDOW_SECONDS } from '@network/shared';
import { redisClient } from '../../../core/config/redis.js';

const coldOutreachKey = (userId: string): string =>
  `message:cold-outreach:${userId}`;

export const incrementColdOutreachCount = async (
  userId: string
): Promise<number> => {
  const key = coldOutreachKey(userId);
  const count = await redisClient.incr(key);
  if (count === 1) {
    await redisClient.expire(key, MESSAGE_COLD_OUTREACH_WINDOW_SECONDS);
  }
  return count;
};
