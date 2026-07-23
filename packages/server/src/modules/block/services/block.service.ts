import { ApiError } from '../../../core/utils/ApiError.js';
import * as blockRepository from '../block.repository.js';
import * as followRepository from '../../follow/follow.repository.js';
import * as followRequestRepository from '../../follow/followRequest.repository.js';
import * as userRepository from '../../user/user.repository.js';
import type { IUserDocument } from '../../user/user.model.js';

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
  ]);
};

export const unblockUser = async (
  blockerId: string,
  targetUsername: string
): Promise<void> => {
  const target = await resolveActiveTarget(targetUsername);
  await blockRepository.deleteRelation(blockerId, target._id.toString());
};
