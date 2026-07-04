import {
  UPLOAD_SESSION_TTL_SECONDS,
  type IInitiateVideoUploadResult,
  type IVideoResponse,
  type IVideoActionResult,
  type InitiateVideoUploadInput,
  type VideoUpdateInput,
  type VideoUploadInput,
  type IMediaStatusEvent,
} from '@network/shared';
import * as videoRepository from './video.repository.js';
import * as creatorService from '../creator/creator.service.js';
import {
  storageProvider,
  videoProvider,
  imageProvider,
} from '../../providers/provider.js';
import { redisClient } from '../../config/redis.js';
import { logger } from '../../utils/logger.js';
import { VideoModel, type IVideoDocument } from './video.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getOwnerId } from '../../utils/getOwnerId.js';
import { emitToUser } from '../../config/socket.js';
import type { NormalizedWebhookPayload } from '../../providers/types.js';
import type { Requester } from './video.types.js';

const uploadSessionKey = (storageKey: string): string =>
  `video_upload_session:${storageKey}`;

const toResponse = (doc: IVideoDocument): IVideoResponse =>
  doc.toJSON() as IVideoResponse;

const toResponseFromLean = (doc: IVideoDocument): IVideoResponse =>
  VideoModel.hydrate(doc, undefined, {
    hydratedPopulatedDocs: true,
  }).toJSON() as unknown as IVideoResponse;

export const initiateUpload = async (
  userId: string,
  data: InitiateVideoUploadInput
): Promise<IInitiateVideoUploadResult> => {
  const placeholder = await videoRepository.createPlaceholder(
    userId,
    data.fileName
  );
  const videoId = placeholder._id.toString();

  const { url: presignedUrl, key: storageKey } =
    await storageProvider.presignUpload(
      'video',
      userId,
      videoId,
      data.mimeType,
      data.fileSizeBytes
    );

  await redisClient.set(
    uploadSessionKey(storageKey),
    `${userId}:${videoId}`,
    'EX',
    UPLOAD_SESSION_TTL_SECONDS
  );

  return { videoId, presignedUrl, storageKey };
};

export const confirmUpload = async (
  userId: string,
  videoId: string,
  storageKey: string,
  fileSizeBytes: number
): Promise<IVideoActionResult> => {
  const sessionValue = await redisClient.get(uploadSessionKey(storageKey));
  if (sessionValue !== `${userId}:${videoId}`) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'This upload session does not belong to you or has expired.'
    );
  }

  if (!storageProvider.isOwnedKey(storageKey, 'video', userId, videoId)) {
    throw new ApiError(403, 'FORBIDDEN', 'Invalid storage key.');
  }

  const placeholder = await videoRepository.findById(videoId);
  if (!placeholder) {
    throw new ApiError(404, 'NOT_FOUND', 'Video record not found.');
  }

  const storageUrl = await storageProvider.buildAccessUrl(storageKey);

  const { providerVideoId } = await videoProvider.ingestFromUrl({
    storageUrl,
    fileName: placeholder.title,
    fileSizeBytes,
    userId,
  });

  const video = await videoRepository.updateById(videoId, {
    providerVideoId,
    storageKey,
    status: 'PROCESSING',
  });

  if (!video) {
    throw new ApiError(404, 'NOT_FOUND', 'Video record not found.');
  }

  await redisClient.del(uploadSessionKey(storageKey));

  return { video: toResponse(video), creatorEvent: null };
};

export const uploadThumbnail = async (
  buffer: Buffer,
  mimeType: string
): Promise<string> => imageProvider.uploadImage(buffer, mimeType);

export const finaliseVideo = async (
  videoId: string,
  userId: string,
  data: VideoUploadInput
): Promise<IVideoActionResult> => {
  const video = await videoRepository.findById(videoId);
  if (!video) {
    throw new ApiError(404, 'NOT_FOUND', 'Video not found.');
  }
  if (getOwnerId(video.userId) !== userId) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not own this video.');
  }

  const alreadyRecorded = video.metricsRecorded === true;

  const updated = await videoRepository.updateById(videoId, {
    title: data.title,
    category: data.category,
    tags: data.tags,
    visibility: data.visibility,
    ...(data.description !== undefined && { description: data.description }),
    ...(data.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
    ...(!alreadyRecorded && { metricsRecorded: true }),
  });

  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Video not found.');
  }

  const creatorEvent = alreadyRecorded
    ? null
    : await creatorService.recordPublish(userId, 'video');

  return { video: toResponse(updated), creatorEvent };
};

export const getVideoById = async (
  videoId: string,
  requester?: Requester
): Promise<IVideoResponse> => {
  const video = await videoRepository.findById(videoId);

  if (!video) throw new ApiError(404, 'NOT_FOUND', 'Video not found.');

  const isOwner = requester?.id === getOwnerId(video.userId);
  const isAdmin = requester?.role === 'admin';
  const canBypassRestrictions = isOwner || isAdmin;

  if (!canBypassRestrictions && video.status !== 'READY')
    throw new ApiError(404, 'NOT_FOUND', 'Video not found.');
  if (!canBypassRestrictions && video.visibility === 'private')
    throw new ApiError(404, 'NOT_FOUND', 'Video not found.');

  if (!isOwner) {
    videoRepository
      .incrementViews(videoId)
      .then((updated) => {
        if (!updated) return;
        return creatorService.recordViewIncrement(
          getOwnerId(updated.userId),
          videoId,
          updated.views
        );
      })
      .catch((e) =>
        logger.error(
          e,
          `Failed to increment views/creator metrics for ${videoId}`
        )
      );
  }

  return toResponse(video);
};

export const getPublicFeed = async (page: number, limit: number) => {
  const result = await videoRepository.findPublicFeed(page, limit);
  return { ...result, data: result.data.map(toResponseFromLean) };
};

export const getMyVideos = async (
  userId: string,
  page: number,
  limit: number
) => {
  const result = await videoRepository.findByUserId(userId, page, limit);
  return { ...result, data: result.data.map(toResponseFromLean) };
};

export const updateVideo = async (
  videoId: string,
  requester: Requester,
  data: VideoUpdateInput
): Promise<IVideoResponse> => {
  const video = await videoRepository.findById(videoId);
  if (!video) throw new ApiError(404, 'NOT_FOUND', 'Video not found.');

  if (getOwnerId(video.userId) !== requester.id && requester.role !== 'admin') {
    throw new ApiError(403, 'FORBIDDEN', 'You cannot edit this video.');
  }

  const updated = await videoRepository.updateById(videoId, {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.category !== undefined && { category: data.category }),
    ...(data.tags !== undefined && { tags: data.tags }),
    ...(data.visibility !== undefined && { visibility: data.visibility }),
  });

  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Video not found.');
  return toResponse(updated);
};

export const deleteVideo = async (
  videoId: string,
  requester: Requester
): Promise<void> => {
  const video = await videoRepository.findById(videoId);
  if (!video) throw new ApiError(404, 'NOT_FOUND', 'Video not found.');

  if (getOwnerId(video.userId) !== requester.id && requester.role !== 'admin') {
    throw new ApiError(403, 'FORBIDDEN', 'You cannot delete this video.');
  }

  const deleted = await videoRepository.deleteById(videoId);
  if (!deleted) throw new ApiError(404, 'NOT_FOUND', 'Video not found.');

  if (deleted.providerVideoId) {
    await videoProvider.deleteVideo(deleted.providerVideoId);
  }
  if (deleted.storageKey) {
    await storageProvider.deleteObject(deleted.storageKey);
  }
  if (deleted.thumbnailUrl) {
    await imageProvider
      .deleteImage(deleted.thumbnailUrl)
      .catch((e) =>
        logger.warn(e, `Failed to delete thumbnail ${deleted.thumbnailUrl}`)
      );
  }
};

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
