import { useCallback, useState } from 'react';
import type { PaginatedResponse } from '@network/shared';

interface FeedQueryArgs {
  cursor?: string;
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
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isFirstPage, setIsFirstPage] = useState(true);

  const { data, isLoading, isError, isFetching, refetch } = useFeedQuery({
    ...(cursor !== undefined && { cursor }),
    limit,
  });

  const items = data?.data ?? [];
  const hasNextPage = data?.meta.hasNextPage ?? false;

  const loadMore = useCallback(() => {
    if (!hasNextPage || isFetching || !data?.meta.nextCursor) return;
    setIsFirstPage(false);
    setCursor(data.meta.nextCursor);
  }, [hasNextPage, isFetching, data?.meta.nextCursor]);

  const retry = useCallback(() => {
    if (isFirstPage) {
      refetch();
    } else {
      setIsFirstPage(true);
      setCursor(undefined);
    }
  }, [isFirstPage, refetch]);

  return {
    items,
    isLoading: isLoading && isFirstPage,
    isFetchingNextPage: isFetching && !isFirstPage,
    isError,
    hasNextPage,
    loadMore,
    retry,
  };
};
