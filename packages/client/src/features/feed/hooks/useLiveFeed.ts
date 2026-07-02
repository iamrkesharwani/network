import { useCallback, useState } from 'react';
import type { PaginatedResponse } from '@network/shared';

interface FeedQueryArgs {
  page: number;
  limit: number;
}

interface FeedQueryResult<T> {
  data?: PaginatedResponse<T>;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

type UseFeedQueryHook<T> = (args: FeedQueryArgs) => FeedQueryResult<T>;

export interface UseLiveFeedResult<T> {
  items: T[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  hasNextPage: boolean;
  loadMore: () => void;
  retry: () => void;
}

export const useLiveFeed = <T extends { id: string }>(
  useFeedQuery: UseFeedQueryHook<T>,
  limit: number
) => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching, refetch } = useFeedQuery({
    page,
    limit,
  });

  const items = data?.data ?? [];
  const hasNextPage = data?.meta.hasNextPage ?? false;

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetching) return;
    setPage((p) => p + 1);
  }, [page, refetch]);

  const retry = useCallback(() => {
    if (page === 1) {
      refetch();
    } else {
      setPage(1);
    }
  }, [page, refetch]);

  return {
    items,
    isLoading: isLoading && page === 1,
    isFetchingNextPage: isFetching && page > 1,
    isError,
    hasNextPage,
    loadMore,
    retry,
  };
};
