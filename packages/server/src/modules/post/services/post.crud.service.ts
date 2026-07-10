import type { IPostResponse, PostUpdateInput } from '@network/shared';
import * as postRepository from '../post.repository.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import { buildVisibilityFields } from '../../../core/utils/buildVisibilityFields.js';
import type { Requester } from '../post.types.js';
import { toResponse, toResponseFromLean } from './post.mappers.js';
import { recordViewIncrement } from '../../creator/services/creator.views.service.js';
import { logger } from '../../../core/utils/logger.js';

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

export const getMyPosts = async (
  userId: string,
  cursor: string | null,
  limit: number
) => {
  const result = await postRepository.findByUserId(userId, cursor, limit);
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
