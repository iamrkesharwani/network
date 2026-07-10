import type { IFeedItem } from '@network/shared';
import { UNIFIED_FEED_PAGE_SIZE } from '@network/shared';
import { useLiveFeed, type UseLiveFeedResult } from './useLiveFeed';
import { feedApi } from '../feedApi';

export const useLiveUnifiedFeed = (
  limit: number = UNIFIED_FEED_PAGE_SIZE
): UseLiveFeedResult<IFeedItem> => useLiveFeed(feedApi.useGetFeedQuery, limit);
