import {
  SHORT_UPLOAD_SESSION_TTL_SECONDS,
  type IInitiateShortUploadResult,
  type IShortResponse,
  type IShortActionResult,
  type InitiateShortUploadInput,
  type ShortUploadInput,
} from '@network/shared';
import * as shortRepository from '../short.repository.js';
import { storageProvider, imageProvider } from '../../../core/providers/provider.js';
import { redisClient } from '../../../core/config/redis.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import { buildVisibilityFields } from '../../../core/utils/buildVisibilityFields.js';
import { uploadSessionKey, toResponse } from './short.mappers.js';
import { recordPublish } from '../../creator/services/creator.publish.service.js';
import { ingestFromStorage } from '../../upload/services/upload.ingest.service.js';

export const initiateUpload = async (
  userId: string,
  data: InitiateShortUploadInput
): Promise<IInitiateShortUploadResult> => {
  const placeholder = await shortRepository.createPlaceholder(
    userId,
    data.fileName
  );
  const shortId = placeholder._id.toString();

  const { url: presignedUrl, key: storageKey } =
    await storageProvider.presignUpload(
      'short',
      userId,
      shortId,
      data.mimeType,
      data.fileSizeBytes
    );

  await redisClient.set(
    uploadSessionKey(storageKey),
    `${userId}:${shortId}`,
    'EX',
    SHORT_UPLOAD_SESSION_TTL_SECONDS
  );

  return { shortId, presignedUrl, storageKey };
};

export const confirmUpload = async (
  userId: string,
  shortId: string,
  storageKey: string,
  fileSizeBytes: number
): Promise<IShortResponse> => {
  const sessionValue = await redisClient.get(uploadSessionKey(storageKey));
  if (sessionValue !== `${userId}:${shortId}`) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'This upload session does not belong to you or has expired.'
    );
  }

  if (!storageProvider.isOwnedKey(storageKey, 'short', userId, shortId)) {
    throw new ApiError(403, 'FORBIDDEN', 'Invalid storage key.');
  }

  const placeholder = await shortRepository.findById(shortId);
  if (!placeholder) {
    throw new ApiError(404, 'NOT_FOUND', 'Short record not found.');
  }

  const { providerVideoId } = await ingestFromStorage({
    storageKey,
    fileName: placeholder.title,
    fileSizeBytes,
    userId,
  });

  const short = await shortRepository.updateById(shortId, {
    providerVideoId,
    storageKey,
    status: 'PROCESSING',
  });

  if (!short) {
    throw new ApiError(404, 'NOT_FOUND', 'Short record not found.');
  }

  await redisClient.del(uploadSessionKey(storageKey));
  return toResponse(short);
};

export const uploadThumbnail = async (
  buffer: Buffer,
  mimeType: string
): Promise<string> => imageProvider.uploadImage(buffer, mimeType);

export const finaliseShort = async (
  shortId: string,
  userId: string,
  data: ShortUploadInput
): Promise<IShortActionResult> => {
  const short = await shortRepository.findById(shortId);
  if (!short) {
    throw new ApiError(404, 'NOT_FOUND', 'Short not found.');
  }
  if (getOwnerId(short.userId) !== userId) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not own this short.');
  }

  const alreadyRecorded = short.metricsRecorded === true;

  const updated = await shortRepository.updateById(shortId, {
    title: data.title,
    tags: data.tags,
    ...buildVisibilityFields(data.visibility),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
    ...(!alreadyRecorded && { metricsRecorded: true }),
  });

  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Short not found.');
  }

  const creatorEvent = alreadyRecorded
    ? null
    : await recordPublish(userId, 'short');

  return { short: toResponse(updated), creatorEvent };
};
