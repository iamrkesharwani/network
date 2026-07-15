import type { IRelatedFeedBatch } from '@network/shared';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as videoRepository from '../video.repository.js';
import {
  getRelatedVideos,
  getPublicFeed as getPublicVideoFeed,
} from './video.crud.service.js';
import {
  getRelatedShorts,
  getPublicFeed as getPublicShortFeed,
} from '../../short/services/short.crud.service.js';

export interface RelatedCursors {
  videoCursor?: string | undefined;
  shortCursor?: string | undefined;
}

const fallbackToPublicVideoFeed = async (
  excludeVideoId: string,
  limit: number
) => {
  const result = await getPublicVideoFeed(null, limit);
  return {
    ...result,
    data: result.data.filter((item) => item.id !== excludeVideoId),
  };
};

export const getRelatedFeed = async (
  videoId: string,
  cursors: RelatedCursors,
  limit: number
): Promise<IRelatedFeedBatch> => {
  const sourceVideo = await videoRepository.findById(videoId);
  if (!sourceVideo) throw new ApiError(404, 'NOT_FOUND', 'Video not found.');

  const [video, short] = await Promise.all([
    getRelatedVideos(
      videoId,
      sourceVideo.category,
      sourceVideo.tags,
      cursors.videoCursor ?? null,
      limit
    ),
    getRelatedShorts(sourceVideo.tags, cursors.shortCursor ?? null, limit),
  ]);

  const isFirstPage = !cursors.videoCursor && !cursors.shortCursor;

  const videoResult =
    isFirstPage && video.data.length === 0
      ? await fallbackToPublicVideoFeed(videoId, limit)
      : video;

  const shortResult =
    isFirstPage && short.data.length === 0
      ? await getPublicShortFeed(null, limit)
      : short;

  return { video: videoResult, short: shortResult };
};
