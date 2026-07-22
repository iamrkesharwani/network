import {
  PRESENCE_REDIS_KEY_PREFIX,
  PRESENCE_ONLINE_SOCKET_EVENT,
  PRESENCE_OFFLINE_SOCKET_EVENT,
} from '@network/shared';
import { redisClient } from '../../../core/config/redis.js';
import { emitToUser } from '../../../core/config/socket.js';
import * as conversationRepository from '../repository/conversation.repository.js';
import * as userRepository from '../../user/user.repository.js';

const presenceKey = (userId: string): string =>
  `${PRESENCE_REDIS_KEY_PREFIX}${userId}`;

export const getOnlineUserIds = async (
  userIds: string[]
): Promise<Set<string>> => {
  const online = new Set<string>();
  if (userIds.length === 0) return online;

  const pipeline = redisClient.pipeline();
  for (const userId of userIds) {
    pipeline.exists(presenceKey(userId));
  }

  const results = await pipeline.exec();
  if (!results) return online;

  results.forEach(([error, exists], index) => {
    if (!error && exists === 1) {
      online.add(userIds[index] as string);
    }
  });

  return online;
};

const notifyPartners = async (
  userId: string,
  event: string,
  payload: unknown
): Promise<void> => {
  const partnerIds =
    await conversationRepository.findDistinctPartnerIds(userId);
  for (const partnerId of partnerIds) {
    emitToUser(partnerId, event, payload);
  }
};

export const handleUserConnected = async (userId: string): Promise<void> => {
  const count = await redisClient.incr(presenceKey(userId));
  if (count === 1) {
    await notifyPartners(userId, PRESENCE_ONLINE_SOCKET_EVENT, {
      userId,
      isOnline: true,
    });
  }
};

export const handleUserDisconnected = async (userId: string): Promise<void> => {
  const count = await redisClient.decr(presenceKey(userId));
  if (count <= 0) {
    await redisClient.del(presenceKey(userId));

    const lastActiveAt = new Date();
    await userRepository.setLastActiveAt(userId, lastActiveAt);

    await notifyPartners(userId, PRESENCE_OFFLINE_SOCKET_EVENT, {
      userId,
      isOnline: false,
      lastActiveAt: lastActiveAt.toISOString(),
    });
  }
};
