import { type CreatePostInput, type IPostActionResult } from '@network/shared';
import * as postRepository from '../post.repository.js';
import { imageProvider } from '../../../core/providers/provider.js';
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
    unlistedAt: data.visibility === 'unlisted' ? new Date() : null,
    unlistedExpiryWarnedAt: null,
  });

  const creatorEvent = await recordPublish(userId, 'post');

  return { post: toResponse(post), creatorEvent };
};
