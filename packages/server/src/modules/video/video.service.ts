import {
  UPLOAD_SESSION_TTL_SECONDS,
  type IInitiateVideoUploadResult,
  type IVideoResponse,
  type IVideoActionResult,
  type InitiateVideoUploadInput,
  type VideoUpdateInput,
  type VideoUploadInput,
} from '@network/shared';
import * as videoRepository from './video.repository.js';
import * as gamificationService from '../gamification/gamification.service.js';
import {
  storageProvider,
  videoProvider,
  imageProvider,
} from '../../providers/provider.js';
import { redisClient } from '../../config/redis.js';
import { logger } from '../../utils/logger.js';
import type { IVideoDocument } from './video.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getOwnerId } from '../../utils/getOwnerId.js';
import type { NormalizedWebhookPayload } from '../../providers/types.js';
import type { Requester } from './video.types.js';

const uploadSessionKey = (storageKey: string): string =>
  `video_upload_session:${storageKey}`;

const toResponse = (doc: IVideoDocument): IVideoResponse =>
  doc.toJSON() as IVideoResponse;

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

  if (!storageProvider.isOwnedKey(storageKey, userId, videoId)) {
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

  const gamification = await gamificationService.awardForUploadStarted(userId);

  return { video: toResponse(video), gamification };
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

  const alreadyAwarded = video.xpAwarded === true;

  const updated = await videoRepository.updateById(videoId, {
    title: data.title,
    category: data.category,
    tags: data.tags,
    visibility: data.visibility,
    ...(data.description !== undefined && { description: data.description }),
    ...(data.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
    ...(!alreadyAwarded && { xpAwarded: true }),
  });

  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Video not found.');
  }

  const gamification = alreadyAwarded
    ? await gamificationService.getSnapshot(userId)
    : await gamificationService.awardForVideoPublished(userId, {
        tags: data.tags,
        hasCustomThumbnail: !!data.thumbnailUrl,
        ...(data.description !== undefined && {
          description: data.description,
        }),
      });

  return { video: toResponse(updated), gamification };
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
      .catch((e) =>
        logger.error(e, `Failed to increment views for ${videoId}`)
      );
  }

  return toResponse(video);
};

export const getPublicFeed = (page: number, limit: number) =>
  videoRepository.findPublicFeed(page, limit);

export const getMyVideos = (userId: string, page: number, limit: number) =>
  videoRepository.findByUserId(userId, page, limit);

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
): Promise<void> => {
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

  if (!video) {
    logger.warn(
      `Webhook for unknown providerVideoId: ${payload.providerVideoId}`
    );
  }
};
