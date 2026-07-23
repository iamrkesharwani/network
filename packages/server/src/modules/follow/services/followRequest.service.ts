import type { IFollowRequestListItem, PaginatedResponse } from '@network/shared';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as followRepository from '../follow.repository.js';
import * as followRequestRepository from '../followRequest.repository.js';
import type { IFollowRequestDocument } from '../followRequest.model.js';
import { queueNotification } from '../../notification/notification.queue.js';

interface PopulatedRequester {
  _id: { toString(): string };
  username: string;
  name: string;
  avatarUrl?: string;
}

const toFollowRequestListItem = (
  doc: IFollowRequestDocument
): IFollowRequestListItem | null => {
  const requester = doc.requesterId as unknown as PopulatedRequester | null;
  if (!requester || !requester.username) return null;

  return {
    id: doc._id.toString(),
    requesterId: requester._id.toString(),
    username: requester.username,
    name: requester.name,
    ...(requester.avatarUrl && { avatarUrl: requester.avatarUrl }),
    requestedAt: doc.createdAt.toISOString(),
  };
};

export const listIncomingFollowRequests = async (
  targetId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IFollowRequestListItem>, 'success' | 'message'>> => {
  const result = await followRequestRepository.findIncomingForTarget(
    targetId,
    cursor,
    limit
  );

  const data = result.data
    .map(toFollowRequestListItem)
    .filter((item): item is IFollowRequestListItem => item !== null);

  return { ...result, data };
};

export const countIncomingFollowRequests = (targetId: string): Promise<number> =>
  followRequestRepository.countIncomingForTarget(targetId);

export const approveFollowRequest = async (
  targetId: string,
  requestId: string
): Promise<void> => {
  const request = await followRequestRepository.findByIdForTarget(
    requestId,
    targetId
  );
  if (!request) {
    throw new ApiError(404, 'NOT_FOUND', 'Follow request not found.');
  }

  const requesterId = request.requesterId.toString();

  await followRequestRepository.deleteRelation(requesterId, targetId);
  await followRepository.create(requesterId, targetId);

  await queueNotification({
    type: 'follow_request_accepted',
    recipientId: requesterId,
    actorId: targetId,
    targetType: 'none',
  });
};

export const denyFollowRequest = async (
  targetId: string,
  requestId: string
): Promise<void> => {
  const request = await followRequestRepository.findByIdForTarget(
    requestId,
    targetId
  );
  if (!request) {
    throw new ApiError(404, 'NOT_FOUND', 'Follow request not found.');
  }

  await followRequestRepository.deleteRelation(
    request.requesterId.toString(),
    targetId
  );
};

export const convertPendingRequestsToFollows = async (
  targetId: string
): Promise<void> => {
  const pending = await followRequestRepository.findAllForTarget(targetId);
  if (pending.length === 0) return;

  await Promise.all(
    pending.map((request) =>
      followRepository.create(request.requesterId.toString(), targetId)
    )
  );
  await followRequestRepository.deleteAllForTarget(targetId);
};
