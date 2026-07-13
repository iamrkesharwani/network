import { randomUUID } from 'node:crypto';
import {
  CAPTION_KEY_PREFIX,
  CAPTION_LANGUAGES,
  MAX_CAPTIONS_PER_VIDEO,
  type CaptionUploadInput,
  type IVideoResponse,
} from '@network/shared';
import * as videoRepository from '../video.repository.js';
import { processedStorageProvider } from '../../../core/providers/provider.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import type { Requester } from '../video.types.js';
import { toResponse } from './video.mappers.js';

const buildCaptionStorageKey = (videoId: string): string =>
  `${CAPTION_KEY_PREFIX}/${videoId}/${randomUUID()}.vtt`;

export const addCaption = async (
  videoId: string,
  requester: Requester,
  file: Express.Multer.File,
  data: CaptionUploadInput
): Promise<IVideoResponse> => {
  const video = await videoRepository.findById(videoId);
  if (!video) throw new ApiError(404, 'NOT_FOUND', 'Video not found.');

  if (getOwnerId(video.userId) !== requester.id) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not own this video.');
  }

  if (video.captions.length >= MAX_CAPTIONS_PER_VIDEO) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `A video can have at most ${MAX_CAPTIONS_PER_VIDEO} caption tracks.`
    );
  }

  if (video.captions.some((caption) => caption.language === data.language)) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'This video already has a caption track in that language.'
    );
  }

  const languageEntry = CAPTION_LANGUAGES.find(
    (language) => language.code === data.language
  );
  if (!languageEntry) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Unsupported caption language.'
    );
  }

  const storageKey = buildCaptionStorageKey(videoId);
  await processedStorageProvider.uploadObject(
    storageKey,
    file.buffer,
    'text/vtt'
  );
  const url = processedStorageProvider.buildPublicUrl(storageKey);

  if (data.isDefault) {
    await videoRepository.clearCaptionDefaults(videoId);
  }

  const updated = await videoRepository.pushCaption(videoId, {
    language: languageEntry.code,
    label: languageEntry.label,
    url,
    storageKey,
    isDefault: data.isDefault,
  });

  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Video not found.');
  return toResponse(updated);
};

export const removeCaption = async (
  videoId: string,
  captionId: string,
  requester: Requester
): Promise<IVideoResponse> => {
  const video = await videoRepository.findByIdWithCaptionStorageKeys(videoId);
  if (!video) throw new ApiError(404, 'NOT_FOUND', 'Video not found.');

  if (getOwnerId(video.userId) !== requester.id) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not own this video.');
  }

  const caption = video.captions.find(
    (candidate) => candidate._id.toString() === captionId
  );
  if (!caption) throw new ApiError(404, 'NOT_FOUND', 'Caption not found.');

  await processedStorageProvider.deleteObject(caption.storageKey);

  const updated = await videoRepository.pullCaption(videoId, captionId);
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Video not found.');
  return toResponse(updated);
};

export const setDefaultCaption = async (
  videoId: string,
  captionId: string,
  requester: Requester
): Promise<IVideoResponse> => {
  const video = await videoRepository.findById(videoId);
  if (!video) throw new ApiError(404, 'NOT_FOUND', 'Video not found.');

  if (getOwnerId(video.userId) !== requester.id) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not own this video.');
  }

  const exists = video.captions.some(
    (candidate) => candidate._id.toString() === captionId
  );
  if (!exists) throw new ApiError(404, 'NOT_FOUND', 'Caption not found.');

  const updated = await videoRepository.setCaptionDefault(videoId, captionId);
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Video not found.');
  return toResponse(updated);
};
