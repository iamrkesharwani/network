import { useLiveFeed, type UseLiveFeedResult } from './useLiveFeed';
import { shortApi } from '../../short/shortApi';
import { SHORTS_FEED_PAGE_SIZE, type IShortResponse } from '@network/shared';

export const useLiveShortsFeed = (
  limit: number = SHORTS_FEED_PAGE_SIZE
): UseLiveFeedResult<IShortResponse> =>
  useLiveFeed(shortApi.useGetFeedQuery, limit);
