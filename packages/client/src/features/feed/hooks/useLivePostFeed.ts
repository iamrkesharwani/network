import type { IPostResponse } from '@network/shared';
import { POSTS_FEED_PAGE_SIZE } from '@network/shared';
import { useLiveFeed, type UseLiveFeedResult } from './useLiveFeed';
import { postApi } from '../../post/postApi';

export const useLivePostFeed = (
  limit: number = POSTS_FEED_PAGE_SIZE
): UseLiveFeedResult<IPostResponse> =>
  useLiveFeed(postApi.useGetFeedQuery, limit);
