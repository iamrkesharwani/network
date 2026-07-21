import {
  ENGAGEMENT_COUNT_SOCKET_EVENT,
  type ContentType,
  type ICommentResponse,
  type PaginatedResponse,
} from '@network/shared';
import * as commentRepository from './comment.repository.js';
import { toResponse, toResponseFromLean } from './comment.mappers.js';
import { getModerationContentAdapter } from '../../core/moderation/moderationContent.registry.js';
import { getContentCounterAdapter } from '../../core/contentRef/contentCounter.registry.js';
import { emitToContent } from '../../core/config/socket.js';
import { ApiError } from '../../core/utils/ApiError.js';
import { getOwnerId } from '../../core/utils/getOwnerId.js';

export const createComment = async (
  userId: string,
  contentType: ContentType,
  contentId: string,
  text: string,
  parentCommentId?: string
): Promise<ICommentResponse> => {
  const moderationAdapter = getModerationContentAdapter(contentType);
  if (!moderationAdapter) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      `Commenting on ${contentType} content is not available yet.`
    );
  }

  const { exists } = await moderationAdapter.lookup(contentId);
  if (!exists) {
    throw new ApiError(404, 'NOT_FOUND', 'Content not found.');
  }

  const parentComment = parentCommentId
    ? await commentRepository.findById(parentCommentId)
    : null;

  if (parentCommentId && (!parentComment || parentComment.deletedAt)) {
    throw new ApiError(
      404,
      'NOT_FOUND',
      'The comment you are replying to was not found.'
    );
  }

  const comment = await commentRepository.create(
    userId,
    contentType,
    contentId,
    text,
    parentCommentId ?? null
  );

  if (parentComment) {
    const parentId = parentComment._id.toString();
    const repliesResult = await commentRepository.incrementReplies(parentId);
    emitToContent('comment', parentId, ENGAGEMENT_COUNT_SOCKET_EVENT, {
      contentType: 'comment',
      contentId: parentId,
      field: 'comments',
      count: repliesResult?.repliesCount ?? 0,
    });
  } else {
    const counterAdapter = getContentCounterAdapter(contentType);
    const count = counterAdapter?.incrementComments
      ? await counterAdapter.incrementComments(contentId)
      : 0;
    emitToContent(contentType, contentId, ENGAGEMENT_COUNT_SOCKET_EVENT, {
      contentType,
      contentId,
      field: 'comments',
      count,
    });
  }

  return toResponse(comment);
};

export const listComments = async (
  contentType: ContentType,
  contentId: string,
  parentCommentId: string | null,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<ICommentResponse>, 'success' | 'message'>> => {
  const result = parentCommentId
    ? await commentRepository.findReplies(parentCommentId, cursor, limit)
    : await commentRepository.findTopLevel(
        contentType,
        contentId,
        cursor,
        limit
      );

  return { ...result, data: result.data.map(toResponseFromLean) };
};

export const updateComment = async (
  userId: string,
  commentId: string,
  text: string
): Promise<ICommentResponse> => {
  const comment = await commentRepository.findById(commentId);
  if (!comment || comment.deletedAt) {
    throw new ApiError(404, 'NOT_FOUND', 'Comment not found.');
  }
  if (getOwnerId(comment.userId) !== userId) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'You can only edit your own comments.'
    );
  }

  const updated = await commentRepository.updateText(commentId, text);
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Comment not found.');
  }
  return toResponse(updated);
};

export const deleteComment = async (
  userId: string,
  commentId: string
): Promise<ICommentResponse> => {
  const comment = await commentRepository.findById(commentId);
  if (!comment || comment.deletedAt) {
    throw new ApiError(404, 'NOT_FOUND', 'Comment not found.');
  }
  if (getOwnerId(comment.userId) !== userId) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'You can only delete your own comments.'
    );
  }

  const deleted = await commentRepository.softDeleteById(commentId);
  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'Comment not found.');
  }

  if (comment.parentCommentId) {
    const parentCommentId = comment.parentCommentId.toString();
    const result = await commentRepository.decrementReplies(parentCommentId);
    emitToContent('comment', parentCommentId, ENGAGEMENT_COUNT_SOCKET_EVENT, {
      contentType: 'comment',
      contentId: parentCommentId,
      field: 'comments',
      count: result?.repliesCount ?? 0,
    });
  } else {
    if (comment.repliesCount > 0) {
      await commentRepository.softDeleteManyByParentId(commentId);
    }

    const contentId = comment.contentId.toString();
    const counterAdapter = getContentCounterAdapter(comment.contentType);
    const count = counterAdapter?.decrementComments
      ? await counterAdapter.decrementComments(contentId)
      : 0;
    emitToContent(
      comment.contentType,
      contentId,
      ENGAGEMENT_COUNT_SOCKET_EVENT,
      {
        contentType: comment.contentType,
        contentId,
        field: 'comments',
        count,
      }
    );
  }

  return toResponse(deleted);
};
