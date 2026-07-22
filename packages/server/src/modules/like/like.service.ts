import {
  ENGAGEMENT_COUNT_SOCKET_EVENT,
  type EngageableContentType,
  type ILikeToggleResponse,
} from '@network/shared';
import * as likeRepository from './like.repository.js';
import * as commentRepository from '../comment/comment.repository.js';
import { getModerationContentAdapter } from '../../core/moderation/moderationContent.registry.js';
import { getContentCounterAdapter } from '../../core/contentRef/contentCounter.registry.js';
import { emitToContent } from '../../core/config/socket.js';
import { ApiError } from '../../core/utils/ApiError.js';
import { queueNotification } from '../notification/notification.queue.js';

export const toggleLike = async (
  userId: string,
  contentType: EngageableContentType,
  contentId: string
): Promise<ILikeToggleResponse> => {
  const moderationAdapter = getModerationContentAdapter(contentType);
  const counterAdapter = getContentCounterAdapter(contentType);
  if (!moderationAdapter || !counterAdapter) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      `Liking ${contentType} content is not available yet.`
    );
  }

  const { exists, ownerId } = await moderationAdapter.lookup(contentId);
  if (!exists) {
    throw new ApiError(404, 'NOT_FOUND', 'Content not found.');
  }

  const { liked } = await likeRepository.toggle(userId, contentType, contentId);
  const likesCount = liked
    ? await counterAdapter.incrementLikes(contentId)
    : await counterAdapter.decrementLikes(contentId);

  emitToContent(contentType, contentId, ENGAGEMENT_COUNT_SOCKET_EVENT, {
    contentType,
    contentId,
    field: 'likes',
    count: likesCount,
  });

  if (liked && ownerId) {
    const parentComment =
      contentType === 'comment' ? await commentRepository.findById(contentId) : null;

    await queueNotification({
      type: 'like',
      recipientId: ownerId,
      actorId: userId,
      targetType: contentType,
      targetId: contentId,
      ...(parentComment && {
        contentType: parentComment.contentType,
        contentId: parentComment.contentId.toString(),
        topLevelCommentId: (
          parentComment.parentCommentId ?? parentComment._id
        ).toString(),
      }),
    });
  }

  return { liked, likesCount };
};

export const getLikeStatuses = async (
  userId: string,
  contentType: EngageableContentType,
  contentIds: string[]
): Promise<Record<string, boolean>> => {
  const likedSet = await likeRepository.getUserLikedSet(
    userId,
    contentType,
    contentIds
  );

  const result: Record<string, boolean> = {};
  for (const id of contentIds) {
    result[id] = likedSet.has(id);
  }
  return result;
};
