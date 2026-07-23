import type {
  IPostResponse,
  PostUpdateInput,
  ContentVisibility,
} from '@network/shared';
import * as postRepository from '../post.repository.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import { buildVisibilityFields } from '../../../core/utils/buildVisibilityFields.js';
import type { Requester } from '../post.types.js';
import { toResponse, toResponseFromLean } from './post.mappers.js';
import { recordViewIncrement } from '../../creator/services/creator.views.service.js';
import { logger } from '../../../core/utils/logger.js';
import {
  resolveProfileAccess,
  getContentOwnerAccess,
} from '../../user/services/user.profile.service.js';
import { queueMentionDiffNotifications } from '../../notification/notification.mention.service.js';

export const getUserVisibilityCounts = async (
  username: string,
  requesterId: string | undefined
) => {
  const { userId, isOwner } = await resolveProfileAccess(username, requesterId);
  if (!isOwner) {
    throw new ApiError(403, 'FORBIDDEN', 'You cannot view these counts.');
  }
  return postRepository.countByVisibility(userId);
};

export const getPostById = async (
  postId: string,
  requester?: Requester
): Promise<IPostResponse> => {
  const post = await postRepository.findById(postId);
  if (!post) throw new ApiError(404, 'NOT_FOUND', 'Post not found.');
  const isOwner = requester?.id === getOwnerId(post.userId);
  const isAdmin = requester?.role === 'admin';
  const canBypassRestrictions = isOwner || isAdmin;

  if (!canBypassRestrictions && post.status !== 'READY')
    throw new ApiError(404, 'NOT_FOUND', 'Post not found.');

  if (!canBypassRestrictions && post.visibility !== 'public')
    throw new ApiError(404, 'NOT_FOUND', 'Post not found.');

  if (!canBypassRestrictions) {
    const access = await getContentOwnerAccess(
      getOwnerId(post.userId),
      requester?.id
    );
    if (access.blocked) throw new ApiError(404, 'NOT_FOUND', 'Post not found.');
    if (access.isPrivate && !access.hasAccess) {
      throw new ApiError(403, 'PRIVATE_ACCOUNT', 'This account is private.');
    }
  }

  if (!isOwner) {
    postRepository
      .incrementViews(postId)
      .then((updated) => {
        if (!updated) return;
        return recordViewIncrement(
          getOwnerId(updated.userId),
          postId,
          updated.views
        );
      })
      .catch((e) =>
        logger.error(
          e,
          `Failed to increment views/creator metrics for post ${postId}`
        )
      );
  }

  return toResponse(post);
};

export const getPublicFeed = async (cursor: string | null, limit: number) => {
  const result = await postRepository.findPublicFeed(cursor, limit);
  return { ...result, data: result.data.map(toResponseFromLean) };
};

export const searchPublic = async (
  q: string,
  cursor: string | null,
  limit: number
) => {
  const result = await postRepository.searchPublic(q, cursor, limit);
  return { ...result, data: result.data.map(toResponseFromLean) };
};

export const findByIds = async (ids: string[]): Promise<IPostResponse[]> => {
  const docs = await postRepository.findByIds(ids);
  return docs.map(toResponse);
};

export const getMyPosts = async (
  userId: string,
  cursor: string | null,
  limit: number
) => {
  const result = await postRepository.findByUserId(userId, cursor, limit);
  return { ...result, data: result.data.map(toResponseFromLean) };
};

export const getUserPosts = async (
  username: string,
  requesterId: string | undefined,
  cursor: string | null,
  limit: number,
  visibilityQuery?: ContentVisibility
) => {
  const { userId, isOwner, hasAccess } = await resolveProfileAccess(
    username,
    requesterId
  );

  if (!hasAccess) {
    return { data: [], meta: { nextCursor: null, hasNextPage: false, limit } };
  }

  const extraFilter = isOwner
    ? { ...(visibilityQuery !== undefined && { visibility: visibilityQuery }) }
    : {
        visibility: 'public',
        status: 'READY',
        moderationStatus: { $nin: ['jury_removed', 'admin_removed'] },
      };

  const result = await postRepository.findByUserId(
    userId,
    cursor,
    limit,
    extraFilter
  );
  return { ...result, data: result.data.map(toResponseFromLean) };
};

export const updatePost = async (
  postId: string,
  requester: Requester,
  data: PostUpdateInput
): Promise<IPostResponse> => {
  const post = await postRepository.findById(postId);
  if (!post) throw new ApiError(404, 'NOT_FOUND', 'Post not found.');

  if (getOwnerId(post.userId) !== requester.id && requester.role !== 'admin') {
    throw new ApiError(403, 'FORBIDDEN', 'You cannot edit this post.');
  }

  const updated = await postRepository.updateById(postId, {
    ...(data.text !== undefined && { text: data.text }),
    ...(data.tags !== undefined && { tags: data.tags }),
    ...buildVisibilityFields(data.visibility),
  });

  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Post not found.');

  if (data.text !== undefined) {
    await queueMentionDiffNotifications(post.text ?? '', data.text, {
      actorId: requester.id,
      targetType: 'post',
      targetId: postId,
    });
  }

  return toResponse(updated);
};

export const deletePost = async (
  postId: string,
  requester: Requester
): Promise<void> => {
  const post = await postRepository.findById(postId);
  if (!post) throw new ApiError(404, 'NOT_FOUND', 'Post not found.');

  if (getOwnerId(post.userId) !== requester.id && requester.role !== 'admin') {
    throw new ApiError(403, 'FORBIDDEN', 'You cannot delete this post.');
  }

  const deleted = await postRepository.softDeleteById(postId);
  if (!deleted) throw new ApiError(404, 'NOT_FOUND', 'Post not found.');
};
