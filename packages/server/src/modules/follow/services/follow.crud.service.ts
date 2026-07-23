import type { FollowState, IFollowListItem, PaginatedResponse } from '@network/shared';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as followRepository from '../follow.repository.js';
import * as followRequestRepository from '../followRequest.repository.js';
import * as userRepository from '../../user/user.repository.js';
import type { IUserDocument } from '../../user/user.model.js';
import { toFollowListItem } from './follow.mappers.js';
import { queueNotification } from '../../notification/notification.queue.js';

const resolveActiveTarget = async (username: string): Promise<IUserDocument> => {
  const target = await userRepository.findByUsername(username);
  if (!target || target.status !== 'active') {
    throw new ApiError(404, 'NOT_FOUND', 'User not found.');
  }
  return target;
};

export const follow = async (
  followerId: string,
  targetUsername: string
): Promise<{ state: FollowState }> => {
  const target = await resolveActiveTarget(targetUsername);
  const followeeId = target._id.toString();

  if (followeeId === followerId) {
    throw new ApiError(400, 'BAD_REQUEST', 'You cannot follow yourself.');
  }

  const alreadyFollowing = await followRepository.exists(followerId, followeeId);
  if (alreadyFollowing) {
    throw new ApiError(409, 'CONFLICT', 'You are already following this user.');
  }

  if (target.isPrivate) {
    const alreadyRequested = await followRequestRepository.exists(
      followerId,
      followeeId
    );
    if (alreadyRequested) {
      throw new ApiError(
        409,
        'CONFLICT',
        'You have already requested to follow this user.'
      );
    }

    await followRequestRepository.create(followerId, followeeId);

    await queueNotification({
      type: 'follow_request',
      recipientId: followeeId,
      actorId: followerId,
      targetType: 'none',
    });

    return { state: 'pending' };
  }

  await followRepository.create(followerId, followeeId);

  await queueNotification({
    type: 'follow',
    recipientId: followeeId,
    actorId: followerId,
    targetType: 'none',
  });

  return { state: 'accepted' };
};

export const unfollow = async (
  followerId: string,
  targetUsername: string
): Promise<void> => {
  const target = await resolveActiveTarget(targetUsername);
  const followeeId = target._id.toString();

  await Promise.all([
    followRepository.deleteRelation(followerId, followeeId),
    followRequestRepository.deleteRelation(followerId, followeeId),
  ]);
};

export const getFollowStatesBatch = async (
  viewerId: string,
  targetIds: string[]
): Promise<Map<string, FollowState>> => {
  if (targetIds.length === 0) return new Map();

  const [followedSet, requestedSet] = await Promise.all([
    followRepository.findFollowedSet(viewerId, targetIds),
    followRequestRepository.findRequestedSet(viewerId, targetIds),
  ]);

  return new Map(
    targetIds.map((id) => [
      id,
      followedSet.has(id)
        ? ('accepted' as const)
        : requestedSet.has(id)
          ? ('pending' as const)
          : ('none' as const),
    ])
  );
};

const withViewerFollowState = async (
  items: IFollowListItem[],
  viewerId: string | undefined
): Promise<IFollowListItem[]> => {
  if (!viewerId || items.length === 0) return items;

  const statesById = await getFollowStatesBatch(
    viewerId,
    items.map((item) => item.id)
  );

  return items.map((item) => ({
    ...item,
    followState: statesById.get(item.id) ?? 'none',
  }));
};

export const getFollowers = async (
  username: string,
  cursor: string | null,
  limit: number,
  viewerId?: string
): Promise<Omit<PaginatedResponse<IFollowListItem>, 'success' | 'message'>> => {
  const target = await resolveActiveTarget(username);
  const result = await followRepository.findFollowers(
    target._id.toString(),
    cursor,
    limit
  );

  const items = result.data
    .map((doc) => toFollowListItem(doc, 'followerId'))
    .filter((item): item is IFollowListItem => item !== null);

  return { ...result, data: await withViewerFollowState(items, viewerId) };
};

export const getFollowing = async (
  username: string,
  cursor: string | null,
  limit: number,
  viewerId?: string
): Promise<Omit<PaginatedResponse<IFollowListItem>, 'success' | 'message'>> => {
  const target = await resolveActiveTarget(username);
  const result = await followRepository.findFollowing(
    target._id.toString(),
    cursor,
    limit
  );

  const items = result.data
    .map((doc) => toFollowListItem(doc, 'followeeId'))
    .filter((item): item is IFollowListItem => item !== null);

  return { ...result, data: await withViewerFollowState(items, viewerId) };
};

export const isFollowing = (
  followerId: string,
  followeeId: string
): Promise<boolean> => followRepository.exists(followerId, followeeId);

export const getFollowedSet = (
  followerId: string,
  followeeIds: string[]
): Promise<Set<string>> => followRepository.findFollowedSet(followerId, followeeIds);

export const removeFollower = async (
  followeeId: string,
  followerUsername: string
): Promise<void> => {
  const follower = await userRepository.findByUsername(followerUsername);
  if (!follower) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found.');
  }

  await followRepository.deleteRelation(follower._id.toString(), followeeId);
};
