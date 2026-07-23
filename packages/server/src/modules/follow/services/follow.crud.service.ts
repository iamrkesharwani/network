import type { IFollowListItem, PaginatedResponse } from '@network/shared';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as followRepository from '../follow.repository.js';
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
): Promise<void> => {
  const target = await resolveActiveTarget(targetUsername);
  const followeeId = target._id.toString();

  if (followeeId === followerId) {
    throw new ApiError(400, 'BAD_REQUEST', 'You cannot follow yourself.');
  }

  const alreadyFollowing = await followRepository.exists(followerId, followeeId);
  if (alreadyFollowing) {
    throw new ApiError(409, 'CONFLICT', 'You are already following this user.');
  }

  await followRepository.create(followerId, followeeId);

  await queueNotification({
    type: 'follow',
    recipientId: followeeId,
    actorId: followerId,
    targetType: 'none',
  });
};

export const unfollow = async (
  followerId: string,
  targetUsername: string
): Promise<void> => {
  const target = await resolveActiveTarget(targetUsername);
  await followRepository.deleteRelation(followerId, target._id.toString());
};

const withViewerFollowState = async (
  items: IFollowListItem[],
  viewerId: string | undefined
): Promise<IFollowListItem[]> => {
  if (!viewerId || items.length === 0) return items;

  const followedSet = await followRepository.findFollowedSet(
    viewerId,
    items.map((item) => item.id)
  );

  return items.map((item) => ({
    ...item,
    isFollowedByViewer: followedSet.has(item.id),
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
