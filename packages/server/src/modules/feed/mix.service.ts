import type { IMixedFeedBatch } from '@network/shared';
import { FEED_MIX_RATIO, FEED_MIN_FETCH_QUOTA } from '@network/shared';
import { ApiError } from '../../core/utils/ApiError.js';
import {
  getPublicFeed as getGlobalVideoFeed,
  searchPublic as searchPublicVideos,
} from '../video/services/video.crud.service.js';
import {
  getPublicFeed as getGlobalShortFeed,
  searchPublic as searchPublicShorts,
} from '../short/services/short.crud.service.js';
import {
  getPublicFeed as getGlobalPostFeed,
  searchPublic as searchPublicPosts,
} from '../post/services/post.crud.service.js';

export type MixSource = { mode: 'global' } | { mode: 'search'; q: string };

export interface MixCursors {
  videoCursor?: string | undefined;
  shortCursor?: string | undefined;
  postCursor?: string | undefined;
}

const computeQuota = (limit: number, ratio: number, minQuota: number): number =>
  Math.max(1, minQuota, Math.ceil(limit * ratio));

export const composeMixedBatch = async (
  cursors: MixCursors,
  limit: number,
  source: MixSource,
  viewerId?: string
): Promise<IMixedFeedBatch> => {
  const videoQuota = computeQuota(
    limit,
    FEED_MIX_RATIO.video,
    FEED_MIN_FETCH_QUOTA.video
  );
  const shortQuota = computeQuota(
    limit,
    FEED_MIX_RATIO.short,
    FEED_MIN_FETCH_QUOTA.short
  );
  const postQuota = computeQuota(
    limit,
    FEED_MIX_RATIO.post,
    FEED_MIN_FETCH_QUOTA.post
  );

  if (source.mode === 'search') {
    const q = source.q.trim();
    if (!q)
      throw new ApiError(400, 'BAD_REQUEST', 'Search query cannot be empty.');

    const [video, short, post] = await Promise.all([
      searchPublicVideos(q, cursors.videoCursor ?? null, videoQuota, viewerId),
      searchPublicShorts(q, cursors.shortCursor ?? null, shortQuota, viewerId),
      searchPublicPosts(q, cursors.postCursor ?? null, postQuota, viewerId),
    ]);

    return { video, short, post };
  }

  const [video, short, post] = await Promise.all([
    getGlobalVideoFeed(cursors.videoCursor ?? null, videoQuota, viewerId),
    getGlobalShortFeed(cursors.shortCursor ?? null, shortQuota, viewerId),
    getGlobalPostFeed(cursors.postCursor ?? null, postQuota, viewerId),
  ]);

  return { video, short, post };
};
