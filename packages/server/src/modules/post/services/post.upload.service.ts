import {
  POST_UPLOAD_SESSION_TTL_SECONDS,
  type CreatePostInput,
  type IInitiatePostVideoUploadResult,
  type IPostActionResult,
  type InitiatePostVideoUploadInput,
  type PostFinaliseInput,
} from '@network/shared';
import * as postRepository from '../post.repository.js';
import { storageProvider, imageProvider } from '../../../providers/provider.js';
import { redisClient } from '../../../config/redis.js';
import { ApiError } from '../../../utils/ApiError.js';
import { getOwnerId } from '../../../utils/getOwnerId.js';
import { uploadSessionKey, toResponse } from './post.mappers.js';
import { recordPublish } from '../../creator/services/creator.publish.service.js';
import { ingestFromStorage } from '../../upload/services/upload.ingest.service.js';

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

export const initiateVideoUpload = async (
  userId: string,
  data: InitiatePostVideoUploadInput,
  text?: string
): Promise<IInitiatePostVideoUploadResult> => {
  const placeholder = await postRepository.createVideoPlaceholder(userId, text);
  const postId = placeholder._id.toString();

  const { url: presignedUrl, key: storageKey } =
    await storageProvider.presignUpload(
      'post',
      userId,
      postId,
      data.mimeType,
      data.fileSizeBytes
    );

  await redisClient.set(
    uploadSessionKey(storageKey),
    `${userId}:${postId}`,
    'EX',
    POST_UPLOAD_SESSION_TTL_SECONDS
  );

  return { postId, presignedUrl, storageKey };
};

export const confirmVideoUpload = async (
  userId: string,
  postId: string,
  storageKey: string,
  fileSizeBytes: number
) => {
  const sessionValue = await redisClient.get(uploadSessionKey(storageKey));
  if (sessionValue !== `${userId}:${postId}`) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'This upload session does not belong to you or has expired.'
    );
  }

  if (!storageProvider.isOwnedKey(storageKey, 'post', userId, postId)) {
    throw new ApiError(403, 'FORBIDDEN', 'Invalid storage key.');
  }

  const placeholder = await postRepository.findById(postId);
  if (!placeholder) {
    throw new ApiError(404, 'NOT_FOUND', 'Post record not found.');
  }

  const { providerVideoId } = await ingestFromStorage({
    storageKey,
    fileName: `post-${postId}`,
    fileSizeBytes,
    userId,
  });

  const post = await postRepository.updateById(postId, {
    providerVideoId,
    storageKey,
    status: 'PROCESSING',
  });

  if (!post) {
    throw new ApiError(404, 'NOT_FOUND', 'Post record not found.');
  }

  await redisClient.del(uploadSessionKey(storageKey));
  return toResponse(post);
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
