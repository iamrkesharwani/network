import type { IVideoResponse, VideoUpdateInput } from '@network/shared';
import * as videoRepository from '../video.repository.js';
import {
  storageProvider,
  videoProvider,
  imageProvider,
} from '../../../providers/provider.js';
import { logger } from '../../../utils/logger.js';
import { ApiError } from '../../../utils/ApiError.js';
import { getOwnerId } from '../../../utils/getOwnerId.js';
import type { Requester } from '../video.types.js';
import { toResponse, toResponseFromLean } from './video.mappers.js';
import { recordViewIncrement } from '../../creator/services/creator.views.service.js';

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
        return recordViewIncrement(
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

export const getPublicFeed = async (cursor: string | null, limit: number) => {
  const result = await videoRepository.findPublicFeed(cursor, limit);
  return { ...result, data: result.data.map(toResponseFromLean) };
};

export const getMyVideos = async (
  userId: string,
  cursor: string | null,
  limit: number
) => {
  const result = await videoRepository.findByUserId(userId, cursor, limit);
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
