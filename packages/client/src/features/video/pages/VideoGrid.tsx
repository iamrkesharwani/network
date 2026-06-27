import { useEffect, useRef } from 'react';
import { cn } from '../../../shared/utils/cn';
import { useGridCols } from '../hooks/useGridCols';
import { useVideoVirtualizer } from '../hooks/useVideoVirtualizer';
import VideoGridRow from '../components/VideoGridRow';
import VideoEmptyState from '../components/VideoEmptyState';
import VideoErrorState from '../components/VideoErrorState';
import VideoEndDivider from '../components/VideoEndDivider';
import type { IVideoResponse } from '@network/shared';
import { chunkIntoRows } from '../../../shared/utils/grid';
import {
  VideoGridSkeleton,
  VideoRowSkeleton,
} from '../../../shared/skeleton/video/VideoGridSkeleton';

export interface VideoGridProps {
  videos: IVideoResponse[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onEdit?: (video: IVideoResponse) => void;
  onDelete?: (video: IVideoResponse) => void;
  onRetry?: () => void;
  isOwner?: boolean;
  isError?: boolean;
  skeletonCount?: number;
  className?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
}

const VideoGrid = ({
  videos,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  onEdit,
  onDelete,
  onRetry,
  isOwner = false,
  isError = false,
  skeletonCount = 8,
  className,
  emptyMessage = 'No videos yet',
  emptySubMessage = "When videos are added they'll appear here.",
}: VideoGridProps) => {
  const resolvedIsOwner: boolean = isOwner;
  const resolvedHasNextPage: boolean = hasNextPage;
  const resolvedIsFetchingNextPage: boolean = isFetchingNextPage;
  const resolvedSkeletonCount: number = skeletonCount;
  const cols = useGridCols();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    seenIds.current.clear();
  }, [cols]);

  const videoRows = chunkIntoRows(videos, cols);

  const rows = [
    ...videoRows,
    ...(resolvedIsFetchingNextPage
      ? (['skeleton'] as const)
      : !resolvedHasNextPage && videos.length > 0
        ? (['end'] as const)
        : []),
  ];

  const virtualizer = useVideoVirtualizer({
    rows,
    cols,
    scrollRef,
    hasNextPage: resolvedHasNextPage,
    isFetchingNextPage: resolvedIsFetchingNextPage,
    onLoadMore,
  });

  if (isLoading && videos.length === 0) {
    return <VideoGridSkeleton count={resolvedSkeletonCount} cols={cols} />;
  }

  if (isError && videos.length === 0) {
    return <VideoErrorState onRetry={onRetry} />;
  }

  if (videos.length === 0) {
    return (
      <VideoEmptyState message={emptyMessage} subMessage={emptySubMessage} />
    );
  }

  return (
    <div
      ref={scrollRef}
      className={cn('w-full overflow-y-auto', className)}
      style={{ height: '100%', contain: 'strict' }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
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
                paddingBottom: '28px',
              }}
            >
              {row === 'skeleton' ? (
                <VideoRowSkeleton cols={cols} />
              ) : row === 'end' ? (
                <VideoEndDivider />
              ) : (
                <VideoGridRow
                  videos={row}
                  rowIndex={virtualRow.index}
                  cols={cols}
                  isOwner={resolvedIsOwner}
                  seenIds={seenIds}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoGrid;
