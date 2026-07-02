import type { IShortResponse } from '@network/shared';
import { SHORTS_FEED_PAGE_SIZE } from '../feedConfig';
import { useLiveFeed, type UseLiveFeedResult } from './useLiveFeed';
import { shortApi } from '../../short/shortApi';

export const useLiveShortsFeed = (
  limit: number = SHORTS_FEED_PAGE_SIZE
): UseLiveFeedResult<IShortResponse> =>
  useLiveFeed(shortApi.useGetFeedQuery, limit);
