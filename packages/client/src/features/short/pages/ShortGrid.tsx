import { useEffect, useRef } from 'react';
import { cn } from '../../../shared/utils/cn';
import { useShortGridCols } from '../hooks/useShortGridCols';
import { useShortVirtualizer } from '../hooks/useShortVirtualizer';
import { chunkIntoRows } from '../utils/shortGrid';
import ShortGridRow from '../components/ShortGridRow';
import ShortEmptyState from '../components/ShortEmptyState';
import ShortErrorState from '../components/ShortErrorState';
import ShortEndDivider from '../components/ShortEndDivider';
import type { IShortResponse } from '@network/shared';
import {
  ShortGridSkeleton,
  ShortRowSkeleton,
} from '../skeleton/ShortGridSkeleton';

export interface ShortGridProps {
  shorts: IShortResponse[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onEdit?: (short: IShortResponse) => void;
  onDelete?: (short: IShortResponse) => void;
  onRetry?: () => void;
  isOwner?: boolean;
  isError?: boolean;
  skeletonCount?: number;
  className?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
  scrollRef?: React.RefObject<HTMLElement | null>;
}

const ShortGrid = ({
  shorts,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  onEdit,
  onDelete,
  onRetry,
  isOwner = false,
  isError = false,
  skeletonCount = 12,
  className,
  emptyMessage = 'No shorts yet',
  emptySubMessage = "When shorts are added they'll appear here.",
  scrollRef: externalScrollRef,
}: ShortGridProps) => {
  const cols = useShortGridCols();
  const internalScrollRef = useRef<HTMLDivElement | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    seenIds.current.clear();
  }, [cols]);

  const shortRows = chunkIntoRows(shorts, cols);

  const rows = [
    ...shortRows,
    ...(isFetchingNextPage
      ? (['skeleton'] as const)
      : !hasNextPage && shorts.length > 0
        ? (['end'] as const)
        : []),
  ];

  const virtualizer = useShortVirtualizer({
    rows,
    cols,
    scrollRef: (externalScrollRef ??
      internalScrollRef) as React.RefObject<HTMLDivElement | null>,
    widthRef: internalScrollRef,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
  });

  if (isLoading && shorts.length === 0) {
    return <ShortGridSkeleton count={skeletonCount} cols={cols} />;
  }

  if (isError && shorts.length === 0) {
    return <ShortErrorState onRetry={onRetry} />;
  }

  if (shorts.length === 0) {
    return (
      <ShortEmptyState message={emptyMessage} subMessage={emptySubMessage} />
    );
  }

  return (
    <div
      ref={internalScrollRef}
      className={cn('w-full relative', className)}
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index];

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
              paddingBottom: '20px',
            }}
          >
            {row === 'skeleton' ? (
              <ShortRowSkeleton cols={cols} />
            ) : row === 'end' ? (
              <ShortEndDivider />
            ) : (
              <ShortGridRow
                shorts={row}
                rowIndex={virtualRow.index}
                cols={cols}
                isOwner={isOwner}
                seenIds={seenIds}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ShortGrid;
