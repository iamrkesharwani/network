import {
  MAX_POST_VIDEO_DURATION_SECONDS,
  type IMediaStatusEvent,
} from '@network/shared';
import * as postRepository from '../post.repository.js';
import type { NormalizedWebhookPayload } from '../../../providers/types.js';
import { logger } from '../../../utils/logger.js';
import { storageProvider, videoProvider } from '../../../providers/provider.js';
import { emitToUser } from '../../../config/socket.js';
import { getOwnerId } from '../../../utils/getOwnerId.js';

export const postProcessWebhook = async (
  payload: NormalizedWebhookPayload
): Promise<boolean> => {
  if (
    payload.status === 'READY' &&
    payload.duration !== undefined &&
    payload.duration > MAX_POST_VIDEO_DURATION_SECONDS
  ) {
    const rejected = await postRepository.updateByProviderVideoId(
      payload.providerVideoId,
      {
        status: 'FAILED',
        duration: payload.duration,
        errorMessage: `Post videos must be ${MAX_POST_VIDEO_DURATION_SECONDS} seconds or less (received ${payload.duration}s).`,
      }
    );

    if (!rejected) {
      return false;
    }

    logger.warn(
      { postId: rejected._id.toString(), duration: payload.duration },
      'Rejected post video upload: exceeds max post video duration'
    );

    await videoProvider
      .deleteVideo(payload.providerVideoId)
      .catch((e) =>
        logger.warn(
          e,
          `Failed to delete oversized post video asset ${payload.providerVideoId}`
        )
      );

    if (rejected.storageKey) {
      await storageProvider
        .deleteObject(rejected.storageKey)
        .catch((e) =>
          logger.warn(
            e,
            `Failed to delete oversized post storage object ${rejected.storageKey}`
          )
        );
    }

    const rejectedStatusEvent: IMediaStatusEvent = {
      id: rejected._id.toString(),
      mediaType: 'post',
      ...(rejected.text !== undefined && { title: rejected.text }),
      status: rejected.status,
      ...(rejected.duration !== undefined && { duration: rejected.duration }),
      ...(rejected.playbackUrl !== undefined && {
        playbackUrl: rejected.playbackUrl,
      }),
      ...(rejected.thumbnailUrl !== undefined && {
        thumbnailUrl: rejected.thumbnailUrl,
      }),
      ...(rejected.errorMessage !== undefined && {
        errorMessage: rejected.errorMessage,
      }),
    };

    emitToUser(
      getOwnerId(rejected.userId),
      'media:status',
      rejectedStatusEvent
    );

    return true;
  }

  const existing = await postRepository.findByProviderVideoId(
    payload.providerVideoId
  );

  const defaultThumbnailUrl =
    !existing?.thumbnailUrl && payload.thumbnailUrl !== undefined
      ? payload.thumbnailUrl
      : undefined;

  const post = await postRepository.updateByProviderVideoId(
    payload.providerVideoId,
    {
      status: payload.status,
      ...(payload.duration !== undefined && { duration: payload.duration }),
      ...(payload.playbackUrl !== undefined && {
        playbackUrl: payload.playbackUrl,
      }),
      ...(defaultThumbnailUrl !== undefined && {
        thumbnailUrl: defaultThumbnailUrl,
      }),
      ...(payload.errorMessage !== undefined && {
        errorMessage: payload.errorMessage,
      }),
    }
  );

  if (post) {
    const mediaStatusEvent: IMediaStatusEvent = {
      id: post._id.toString(),
      mediaType: 'post',
      ...(post.text !== undefined && { title: post.text }),
      status: post.status,
      ...(post.duration !== undefined && { duration: post.duration }),
      ...(post.playbackUrl !== undefined && {
        playbackUrl: post.playbackUrl,
      }),
      ...(post.thumbnailUrl !== undefined && {
        thumbnailUrl: post.thumbnailUrl,
      }),
      ...(post.errorMessage !== undefined && {
        errorMessage: post.errorMessage,
      }),
    };
    emitToUser(getOwnerId(post.userId), 'media:status', mediaStatusEvent);
  }

  return !!post;
};
