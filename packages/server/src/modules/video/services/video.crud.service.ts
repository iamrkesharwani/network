import type {
  IVideoResponse,
  VideoUpdateInput,
  ContentVisibility,
  VideoCategory,
} from '@network/shared';
import * as videoRepository from '../video.repository.js';
import { logger } from '../../../core/utils/logger.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import { buildVisibilityFields } from '../../../core/utils/buildVisibilityFields.js';
import type { Requester } from '../video.types.js';
import { toResponse, toResponseFromLean } from './video.mappers.js';
import { recordViewIncrement } from '../../creator/services/creator.views.service.js';
import { resolveProfileOwner } from '../../user/services/user.profile.service.js';

export const getUserVisibilityCounts = async (
  username: string,
  requesterId: string | undefined
) => {
  const { userId, isOwner } = await resolveProfileOwner(username, requesterId);
  if (!isOwner) {
    throw new ApiError(403, 'FORBIDDEN', 'You cannot view these counts.');
  }
  return videoRepository.countByVisibility(userId);
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
  if (!canBypassRestrictions && video.visibility !== 'public')
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

export const searchPublic = async (
  q: string,
  cursor: string | null,
  limit: number
) => {
  const result = await videoRepository.searchPublic(q, cursor, limit);
  return { ...result, data: result.data.map(toResponseFromLean) };
};

export const getRelatedVideos = async (
  excludeVideoId: string,
  category: VideoCategory,
  tags: string[],
  cursor: string | null,
  limit: number
) => {
  const result = await videoRepository.findRelated(
    excludeVideoId,
    category,
    tags,
    cursor,
    limit
  );
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

export const getUserVideos = async (
  username: string,
  requesterId: string | undefined,
  cursor: string | null,
  limit: number,
  visibilityQuery?: ContentVisibility
) => {
  const { userId, isOwner } = await resolveProfileOwner(username, requesterId);

  const extraFilter = isOwner
    ? { ...(visibilityQuery !== undefined && { visibility: visibilityQuery }) }
    : { visibility: 'public', status: 'READY' };

  const result = await videoRepository.findByUserId(
    userId,
    cursor,
    limit,
    extraFilter
  );
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
    ...buildVisibilityFields(data.visibility),
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

  const deleted = await videoRepository.softDeleteById(videoId);
  if (!deleted) throw new ApiError(404, 'NOT_FOUND', 'Video not found.');
};
