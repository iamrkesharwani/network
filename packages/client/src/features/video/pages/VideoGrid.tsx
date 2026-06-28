import { useEffect, useRef, useState } from 'react';
import { cn } from '../../../shared/utils/cn';
import { useGridCols } from '../hooks/useGridCols';
import { useVideoVirtualizer } from '../hooks/useVideoVirtualizer';
import { chunkIntoRows, type ColCount } from '../../../shared/utils/videoGrid';
import VideoGridRow from '../components/VideoGridRow';
import VideoEmptyState from '../components/VideoEmptyState';
import VideoErrorState from '../components/VideoErrorState';
import VideoEndDivider from '../components/VideoEndDivider';
import type { IVideoResponse } from '@network/shared';
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
  scrollRef?: React.RefObject<HTMLElement | null>;
  forceCols?: 1 | 2 | 3 | 4;
  hideEndDivider?: boolean;
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
  scrollRef: externalScrollRef,
  forceCols,
  hideEndDivider = false,
}: VideoGridProps) => {
  const resolvedIsOwner: boolean = isOwner;
  const resolvedHasNextPage: boolean = hasNextPage;
  const resolvedIsFetchingNextPage: boolean = isFetchingNextPage;
  const resolvedSkeletonCount: number = skeletonCount;

  const autoCols = useGridCols();
  const cols: ColCount = (forceCols as ColCount) ?? autoCols;
  const internalScrollRef = useRef<HTMLDivElement | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    seenIds.current.clear();
  }, [cols]);

  // When this grid shares a scroll container with content above it whose
  // height can change (e.g. a hero block with async-loading thumbnails),
  // the virtualizer's row offsets need to account for that gap — otherwise
  // rows are positioned as if this grid started at the top of the scroll
  // container, and they render in the wrong place (or not at all) once
  // scrolled past that content.
  useEffect(() => {
    const scrollEl = externalScrollRef?.current;
    const wrapperEl = internalScrollRef.current;
    if (!externalScrollRef || !scrollEl || !wrapperEl) return;

    const measure = () => {
      const wrapperTop = wrapperEl.getBoundingClientRect().top;
      const scrollTop = scrollEl.getBoundingClientRect().top;
      setScrollMargin(wrapperTop - scrollTop + scrollEl.scrollTop);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scrollEl);
    observer.observe(wrapperEl);
    return () => observer.disconnect();
  }, [externalScrollRef]);

  const videoRows = chunkIntoRows(videos, cols);

  const rows = [
    ...videoRows,
    ...(resolvedIsFetchingNextPage
      ? (['skeleton'] as const)
      : !resolvedHasNextPage && videos.length > 0 && !hideEndDivider
        ? (['end'] as const)
        : []),
  ];

  const virtualizer = useVideoVirtualizer({
    rows,
    cols,
    scrollRef: (externalScrollRef ??
      internalScrollRef) as React.RefObject<HTMLDivElement | null>,
    widthRef: internalScrollRef,
    scrollMargin: externalScrollRef ? scrollMargin : undefined,
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
              transform: `translateY(${virtualRow.start - scrollMargin}px)`,
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
  );
};

export default VideoGrid;
