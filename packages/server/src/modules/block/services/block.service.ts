import type { IBlockedUserListItem, PaginatedResponse } from '@network/shared';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as blockRepository from '../block.repository.js';
import * as followRepository from '../../follow/follow.repository.js';
import * as followRequestRepository from '../../follow/followRequest.repository.js';
import * as userRepository from '../../user/user.repository.js';
import * as conversationRepository from '../../message/repository/conversation.repository.js';
import type { IUserDocument } from '../../user/user.model.js';
import type { IBlockDocument } from '../block.model.js';

interface PopulatedBlockedUser {
  _id: { toString(): string };
  username: string;
  name: string;
  avatarUrl?: string;
}

const toBlockedUserListItem = (
  doc: IBlockDocument
): IBlockedUserListItem | null => {
  const blocked = doc.blockedId as unknown as PopulatedBlockedUser | null;
  if (!blocked || !blocked.username) return null;

  return {
    id: blocked._id.toString(),
    username: blocked.username,
    name: blocked.name,
    ...(blocked.avatarUrl && { avatarUrl: blocked.avatarUrl }),
    blockedAt: doc.createdAt.toISOString(),
  };
};

const setDirectConversationHidden = async (
  userIdA: string,
  userIdB: string,
  hidden: boolean
): Promise<void> => {
  const conversation = await conversationRepository.findDirectBetween(
    userIdA,
    userIdB
  );
  if (!conversation) return;

  const conversationId = conversation._id.toString();
  await Promise.all([
    conversationRepository.setHiddenByBlock(conversationId, userIdA, hidden),
    conversationRepository.setHiddenByBlock(conversationId, userIdB, hidden),
  ]);
};

const resolveActiveTarget = async (username: string): Promise<IUserDocument> => {
  const target = await userRepository.findByUsername(username);
  if (!target || target.status !== 'active') {
    throw new ApiError(404, 'NOT_FOUND', 'User not found.');
  }
  return target;
};

export const isBlocked = (userIdA: string, userIdB: string): Promise<boolean> =>
  blockRepository.existsEitherDirection(userIdA, userIdB);

export const getBlockedUserIds = (userId: string): Promise<Set<string>> =>
  blockRepository.findBlockedUserIds(userId);

export const listBlockedUsers = async (
  blockerId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IBlockedUserListItem>, 'success' | 'message'>> => {
  const result = await blockRepository.findBlockedByBlocker(
    blockerId,
    cursor,
    limit
  );

  const data = result.data
    .map(toBlockedUserListItem)
    .filter((item): item is IBlockedUserListItem => item !== null);

  return { ...result, data };
};

export const blockUser = async (
  blockerId: string,
  targetUsername: string
): Promise<void> => {
  const target = await resolveActiveTarget(targetUsername);
  const blockedId = target._id.toString();

  if (blockedId === blockerId) {
    throw new ApiError(400, 'BAD_REQUEST', 'You cannot block yourself.');
  }

  const alreadyBlocked = await blockRepository.existsEitherDirection(
    blockerId,
    blockedId
  );
  if (alreadyBlocked) {
    throw new ApiError(409, 'CONFLICT', 'You have already blocked this user.');
  }

  await blockRepository.create(blockerId, blockedId);

  await Promise.all([
    followRepository.deleteRelation(blockerId, blockedId),
    followRepository.deleteRelation(blockedId, blockerId),
    followRequestRepository.deleteRelation(blockerId, blockedId),
    followRequestRepository.deleteRelation(blockedId, blockerId),
    setDirectConversationHidden(blockerId, blockedId, true),
  ]);
};

export const unblockUser = async (
  blockerId: string,
  targetUsername: string
): Promise<void> => {
  const target = await resolveActiveTarget(targetUsername);
  const blockedId = target._id.toString();

  await blockRepository.deleteRelation(blockerId, blockedId);
  await setDirectConversationHidden(blockerId, blockedId, false);
};
