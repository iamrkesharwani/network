import {
  type CreatePostInput,
  type IPostActionResult,
  type PostFinaliseInput,
} from '@network/shared';
import * as postRepository from '../post.repository.js';
import { imageProvider } from '../../../providers/provider.js';
import { ApiError } from '../../../utils/ApiError.js';
import { getOwnerId } from '../../../utils/getOwnerId.js';
import { toResponse } from './post.mappers.js';
import { recordPublish } from '../../creator/services/creator.publish.service.js';

export const createPost = async (
  userId: string,
  data: CreatePostInput,
  imageFile?: { buffer: Buffer; mimeType: string }
): Promise<IPostActionResult> => {
  let imageUrl: string | undefined;
  let mediaType: 'none' | 'image' = 'none';

  if (imageFile) {
    imageUrl = await imageProvider.uploadImage(
      imageFile.buffer,
      imageFile.mimeType
    );
    mediaType = 'image';
  }

  const post = await postRepository.createTextOrImagePost(userId, {
    ...(data.text !== undefined && { text: data.text }),
    ...(imageUrl !== undefined && { imageUrl }),
    mediaType,
    tags: data.tags ?? [],
    visibility: data.visibility,
  });

  const creatorEvent = await recordPublish(userId, 'post');
  const updated = await postRepository.updateById(post._id.toString(), {
    metricsRecorded: true,
  });

  return { post: toResponse(updated ?? post), creatorEvent };
};

export const finalisePost = async (
  postId: string,
  userId: string,
  data: PostFinaliseInput
): Promise<IPostActionResult> => {
  const post = await postRepository.findById(postId);
  if (!post) {
    throw new ApiError(404, 'NOT_FOUND', 'Post not found.');
  }
  if (getOwnerId(post.userId) !== userId) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not own this post.');
  }

  const alreadyRecorded = post.metricsRecorded === true;

  const updated = await postRepository.updateById(postId, {
    ...(data.text !== undefined && { text: data.text }),
    ...(data.tags !== undefined && { tags: data.tags }),
    visibility: data.visibility,
    ...(!alreadyRecorded && { metricsRecorded: true }),
  });

  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Post not found.');
  }

  const creatorEvent = alreadyRecorded
    ? null
    : await recordPublish(userId, 'post');

  return { post: toResponse(updated), creatorEvent };
};
