import type {
  IPostResponse,
  IShortResponse,
  IVideoResponse,
  SearchType,
} from '@network/shared';
import {
  useLiveFeed,
  type UseLiveFeedResult,
} from '../../feed/hooks/useLiveFeed';
import { DEFAULT_PAGE_LIMIT } from '@network/shared';
import { searchApi } from '../searchApi';

export type SearchByTypeItem = IVideoResponse | IShortResponse | IPostResponse;

export const useLiveSearchByType = (
  q: string,
  type: SearchType,
  limit: number = DEFAULT_PAGE_LIMIT
): UseLiveFeedResult<SearchByTypeItem> =>
  useLiveFeed(
    (args) => searchApi.useSearchByTypeQuery({ q, type, ...args }),
    limit
  );
