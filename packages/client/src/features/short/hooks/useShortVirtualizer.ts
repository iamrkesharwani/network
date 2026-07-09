import type { IShortResponse } from '@network/shared';
import {
  estimateShortRowHeight,
  type ShortColCount,
} from '../utils/shortGrid';
import { useVirtualGrid } from '../../../shared/hooks/useVirtualGrid';

export type SentinelRow = 'skeleton' | 'end';
export type VirtualShortRow = IShortResponse[] | SentinelRow;

interface UseShortVirtualizerOptions {
  rows: VirtualShortRow[];
  cols: ShortColCount;
  scrollRef: React.RefObject<HTMLElement | null>;
  widthRef?: React.RefObject<HTMLElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore?: () => void;
}

export const useShortVirtualizer = ({
  rows,
  cols,
  scrollRef,
  widthRef,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: UseShortVirtualizerOptions) => {
  const containerWidth =
    (widthRef ?? scrollRef).current?.offsetWidth ?? window.innerWidth;

  return useVirtualGrid({
    count: rows.length,
    scrollRef,
    estimateSize: (i) => {
      const row = rows[i];
      if (row === 'skeleton' || row === 'end') return 80;
      return estimateShortRowHeight(containerWidth, cols);
    },
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
  });
};
