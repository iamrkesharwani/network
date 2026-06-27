import { useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface UseVirtualGridOptions {
  count: number;
  scrollRef: React.RefObject<HTMLElement | null>;
  estimateSize: (index: number) => number;
  overscan?: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore?: () => void;
}

export const useVirtualGrid = ({
  count,
  scrollRef,
  estimateSize,
  overscan = 3,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: UseVirtualGridOptions) => {
  const isFirefox =
    typeof window !== 'undefined' &&
    navigator.userAgent.indexOf('Firefox') !== -1;

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current as HTMLElement | null,
    estimateSize,
    overscan,
    measureElement: isFirefox
      ? undefined
      : (el: Element) => el?.getBoundingClientRect().height,
  });

  const lastItem = virtualizer.getVirtualItems().at(-1);
  useEffect(() => {
    if (!lastItem) return;
    if (lastItem.index >= count - 1 && hasNextPage && !isFetchingNextPage) {
      onLoadMore?.();
    }
  }, [lastItem?.index, count, hasNextPage, isFetchingNextPage, onLoadMore]);

  return virtualizer;
};
