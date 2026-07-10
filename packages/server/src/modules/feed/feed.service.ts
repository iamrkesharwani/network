import type { IFeedItem, IVideoResponse, IPostResponse, PaginatedResponse, CursorPaginationMeta } from '@network/shared';
import { UNIFIED_FEED_VIDEO_WEIGHT } from '@network/shared';
import { ApiError } from '../../core/utils/ApiError.js';
import { createSeededRandom, advanceSeededRandom } from '../../core/utils/seededRandom.js';
import {
  decodeFeedCursor,
  encodeFeedCursor,
  createInitialFeedCursor,
  type FeedCursor,
} from '../../core/utils/feedCursor.js';
import { getPublicFeed as getPublicVideoFeed } from '../video/services/video.crud.service.js';
import { getPublicFeed as getPublicPostFeed } from '../post/services/post.crud.service.js';

const resolveCursor = (rawCursor: string | undefined): FeedCursor => {
  if (!rawCursor) {
    return createInitialFeedCursor(Math.floor(Math.random() * 0x100000000));
  }

  const decoded = decodeFeedCursor(rawCursor);
  if (!decoded) {
    throw new ApiError(400, 'BAD_REQUEST', 'Invalid or expired feed cursor.');
  }

  return decoded;
};

export const interleaveFeedPage = (
  videos: IVideoResponse[],
  videoMeta: CursorPaginationMeta,
  posts: IPostResponse[],
  postMeta: CursorPaginationMeta,
  activeCursor: FeedCursor,
  limit: number
): Omit<PaginatedResponse<IFeedItem>, 'success' | 'message'> => {
  const random = createSeededRandom(activeCursor.seed);
  advanceSeededRandom(random, activeCursor.offset);

  const items: IFeedItem[] = [];
  let videoIndex = 0;
  let postIndex = 0;
  let lastConsumedVideoId: string | null = null;
  let lastConsumedPostId: string | null = null;

  while (items.length < limit) {
    const videoRemaining = videoIndex < videos.length;
    const postRemaining = postIndex < posts.length;

    if (!videoRemaining && !postRemaining) break;

    const takeVideo = videoRemaining && postRemaining
      ? random() < UNIFIED_FEED_VIDEO_WEIGHT
      : videoRemaining;

    if (takeVideo) {
      const video = videos[videoIndex++];
      if (!video) break;
      items.push({ type: 'video', item: video });
      lastConsumedVideoId = video.id;
    } else {
      const post = posts[postIndex++];
      if (!post) break;
      items.push({ type: 'post', item: post });
      lastConsumedPostId = post.id;
    }
  }

  const videoLeftover = videos.length - videoIndex;
  const postLeftover = posts.length - postIndex;
  const hasNextPage =
    videoLeftover > 0 ||
    postLeftover > 0 ||
    videoMeta.hasNextPage ||
    postMeta.hasNextPage;

  const nextCursor = hasNextPage
    ? encodeFeedCursor({
        videoCursor: lastConsumedVideoId ?? activeCursor.videoCursor,
        postCursor: lastConsumedPostId ?? activeCursor.postCursor,
        seed: activeCursor.seed,
        offset: activeCursor.offset + items.length,
      })
    : null;

  return {
    data: items,
    meta: { nextCursor, hasNextPage, limit },
  };
};

export const getUnifiedFeed = async (
  rawCursor: string | undefined,
  limit: number
): Promise<Omit<PaginatedResponse<IFeedItem>, 'success' | 'message'>> => {
  const activeCursor = resolveCursor(rawCursor);

  const [videoResult, postResult] = await Promise.all([
    getPublicVideoFeed(activeCursor.videoCursor, limit),
    getPublicPostFeed(activeCursor.postCursor, limit),
  ]);

  return interleaveFeedPage(
    videoResult.data,
    videoResult.meta,
    postResult.data,
    postResult.meta,
    activeCursor,
    limit
  );
};
