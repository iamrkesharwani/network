import type { IVideoResponse } from '@network/shared';
import { VIDEO_FEED_PAGE_SIZE } from '../feedConfig';
import { useLiveFeed, type UseLiveFeedResult } from './useLiveFeed';
import { videoApi } from '../../video/videoApi';

export const useLiveVideoFeed = (
  limit: number = VIDEO_FEED_PAGE_SIZE
): UseLiveFeedResult<IVideoResponse> =>
  useLiveFeed(videoApi.useGetFeedQuery, limit);
