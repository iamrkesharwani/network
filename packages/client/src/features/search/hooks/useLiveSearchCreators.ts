import { DEFAULT_PAGE_LIMIT } from '@network/shared';
import {
  useLiveFeed,
  type UseLiveFeedResult,
} from '../../feed/hooks/useLiveFeed';
import { searchApi } from '../searchApi';
import type { IPublicProfile } from '@network/shared';

export const useLiveSearchCreators = (
  q: string,
  limit: number = DEFAULT_PAGE_LIMIT
): UseLiveFeedResult<IPublicProfile> =>
  useLiveFeed(
    (args) => searchApi.useSearchCreatorsQuery({ q, ...args }),
    limit
  );
