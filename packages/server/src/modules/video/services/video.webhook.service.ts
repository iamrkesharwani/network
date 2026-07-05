import type { IMediaStatusEvent } from '@network/shared';
import * as videoRepository from '../video.repository.js';
import { getOwnerId } from '../../../utils/getOwnerId.js';
import { emitToUser } from '../../../config/socket.js';
import type { NormalizedWebhookPayload } from '../../../providers/types.js';

export const processWebhook = async (
  payload: NormalizedWebhookPayload
): Promise<boolean> => {
  const existing = await videoRepository.findByProviderVideoId(
    payload.providerVideoId
  );

  const defaultThumbnailUrl =
    !existing?.thumbnailUrl && payload.thumbnailUrl !== undefined
      ? payload.thumbnailUrl
      : undefined;

  const video = await videoRepository.updateByProviderVideoId(
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

  if (video) {
    const mediaStatusEvent: IMediaStatusEvent = {
      id: video._id.toString(),
      mediaType: 'video',
      title: video.title,
      status: video.status,
      duration: video.duration,
      ...(video.playbackUrl !== undefined && {
        playbackUrl: video.playbackUrl,
      }),
      ...(video.thumbnailUrl !== undefined && {
        thumbnailUrl: video.thumbnailUrl,
      }),
      ...(video.errorMessage !== undefined && {
        errorMessage: video.errorMessage,
      }),
    };
    emitToUser(getOwnerId(video.userId), 'media:status', mediaStatusEvent);
  }

  return !!video;
};
