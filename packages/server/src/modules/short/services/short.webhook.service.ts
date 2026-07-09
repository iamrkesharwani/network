import {
  MAX_SHORT_DURATION_SECONDS,
  MEDIA_STATUS_SOCKET_EVENT,
  type IMediaStatusEvent,
} from '@network/shared';
import * as shortRepository from '../short.repository.js';
import { storageProvider, videoProvider } from '../../../core/providers/provider.js';
import { logger } from '../../../core/utils/logger.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import { emitToUser } from '../../../core/config/socket.js';
import type { NormalizedWebhookPayload } from '../../../core/providers/types.js';

export const shortProcessWebhook = async (
  payload: NormalizedWebhookPayload
): Promise<boolean> => {
  if (
    payload.status === 'READY' &&
    payload.duration !== undefined &&
    payload.duration > MAX_SHORT_DURATION_SECONDS
  ) {
    const rejected = await shortRepository.updateByProviderVideoId(
      payload.providerVideoId,
      {
        status: 'FAILED',
        duration: payload.duration,
        errorMessage: `Shorts must be ${MAX_SHORT_DURATION_SECONDS} seconds or less (received ${payload.duration}s).`,
      }
    );

    if (!rejected) {
      return false;
    }

    logger.warn(
      { shortId: rejected._id.toString(), duration: payload.duration },
      'Rejected short upload: exceeds max short duration'
    );

    await videoProvider
      .deleteVideo(payload.providerVideoId)
      .catch((e) =>
        logger.warn(
          e,
          `Failed to delete oversized short asset ${payload.providerVideoId}`
        )
      );

    if (rejected.storageKey) {
      await storageProvider
        .deleteObject(rejected.storageKey)
        .catch((e) =>
          logger.warn(
            e,
            `Failed to delete oversized short storage object ${rejected.storageKey}`
          )
        );
    }

    const rejectedStatusEvent: IMediaStatusEvent = {
      id: rejected._id.toString(),
      mediaType: 'short',
      title: rejected.title,
      status: rejected.status,
      duration: rejected.duration,
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
      MEDIA_STATUS_SOCKET_EVENT,
      rejectedStatusEvent
    );

    return true;
  }

  const existing = await shortRepository.findByProviderVideoId(
    payload.providerVideoId
  );

  const defaultThumbnailUrl =
    !existing?.thumbnailUrl && payload.thumbnailUrl !== undefined
      ? payload.thumbnailUrl
      : undefined;

  const short = await shortRepository.updateByProviderVideoId(
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

  if (short) {
    const mediaStatusEvent: IMediaStatusEvent = {
      id: short._id.toString(),
      mediaType: 'short',
      title: short.title,
      status: short.status,
      duration: short.duration,
      ...(short.playbackUrl !== undefined && {
        playbackUrl: short.playbackUrl,
      }),
      ...(short.thumbnailUrl !== undefined && {
        thumbnailUrl: short.thumbnailUrl,
      }),
      ...(short.errorMessage !== undefined && {
        errorMessage: short.errorMessage,
      }),
    };
    emitToUser(getOwnerId(short.userId), MEDIA_STATUS_SOCKET_EVENT, mediaStatusEvent);
  }

  return !!short;
};
