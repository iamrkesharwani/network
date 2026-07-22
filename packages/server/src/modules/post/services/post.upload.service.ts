import { type CreatePostInput, type IPostActionResult } from '@network/shared';
import * as postRepository from '../post.repository.js';
import { imageProvider } from '../../../core/providers/provider.js';
import { toResponse } from './post.mappers.js';
import { recordPublish } from '../../creator/services/creator.publish.service.js';
import { queueMentionNotifications } from '../../notification/notification.mention.service.js';

export const createPost = async (
  userId: string,
  data: CreatePostInput,
  imageFiles: { buffer: Buffer; mimeType: string }[]
): Promise<IPostActionResult> => {
  const imageUrls = await Promise.all(
    imageFiles.map((file) =>
      imageProvider.uploadImage(file.buffer, file.mimeType)
    )
  );
  const mediaType: 'none' | 'image' = imageUrls.length > 0 ? 'image' : 'none';

  const post = await postRepository.createTextOrImagePost(userId, {
    ...(data.text !== undefined && { text: data.text }),
    ...(imageUrls.length > 0 && { imageUrls }),
    mediaType,
    tags: data.tags ?? [],
    visibility: data.visibility,
    unlistedAt: data.visibility === 'unlisted' ? new Date() : null,
    unlistedExpiryWarnedAt: null,
  });

  const creatorEvent = await recordPublish(userId, 'post');

  if (data.text) {
    await queueMentionNotifications(data.text, {
      actorId: userId,
      targetType: 'post',
      targetId: post._id.toString(),
    });
  }

  return { post: toResponse(post), creatorEvent };
};
