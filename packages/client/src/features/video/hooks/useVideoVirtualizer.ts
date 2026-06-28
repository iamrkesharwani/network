import type { IVideoResponse } from '@network/shared';
import {
  estimateRowHeight,
  type ColCount,
} from '../../../shared/utils/videoGrid';
import { useVirtualGrid } from '../../../shared/hooks/useVirtualGrid';

export type SentinelRow = 'skeleton' | 'end';
export type VirtualRow = IVideoResponse[] | SentinelRow;

interface UseVideoVirtualizerOptions {
  rows: VirtualRow[];
  cols: ColCount;
  scrollRef: React.RefObject<HTMLElement | null>;
  widthRef?: React.RefObject<HTMLElement | null>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore?: () => void;
}

export const useVideoVirtualizer = ({
  rows,
  cols,
  scrollRef,
  widthRef,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: UseVideoVirtualizerOptions) => {
  const containerWidth =
    (widthRef ?? scrollRef).current?.offsetWidth ?? window.innerWidth;

  return useVirtualGrid({
    count: rows.length,
    scrollRef,
    estimateSize: (i) => {
      const row = rows[i];
      if (row === 'skeleton' || row === 'end') return 80;
      return estimateRowHeight(containerWidth, cols);
    },
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
  });
};
