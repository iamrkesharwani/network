import {
  UPLOAD_SESSION_TTL_SECONDS,
  type IInitiateVideoUploadResult,
  type IVideoActionResult,
  type InitiateVideoUploadInput,
  type VideoUploadInput,
} from '@network/shared';
import * as videoRepository from '../video.repository.js';
import * as creatorService from '../../creator/creator.service.js';
import {
  storageProvider,
  videoProvider,
  imageProvider,
} from '../../../providers/provider.js';
import { redisClient } from '../../../config/redis.js';
import { ApiError } from '../../../utils/ApiError.js';
import { getOwnerId } from '../../../utils/getOwnerId.js';
import { uploadSessionKey, toResponse } from './video.mappers.js';

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
