import { useEffect, useRef, useState } from 'react';
import { cn } from '../../../shared/utils/cn';
import { useVirtualGrid } from '../../../shared/hooks/useVirtualGrid';
import { useGridCols } from '../../video/hooks/useGridCols';
import PostGridTile from './PostGridTile';
import PostEmptyState from '../components/PostEmptyState';
import PostErrorState from '../components/PostErrorState';
import PostEndDivider from '../components/PostEndDivider';
import {
  POST_TILE_HEIGHT_PX,
  ROW_GAP_PX,
  type IPostResponse,
  type PostRow,
} from '@network/shared';
import {
  COL_CLASS,
  chunkIntoRows,
  type ColCount,
} from '../../video/utils/videoGrid';
import {
  PostTileGridSkeleton,
  PostTileRowSkeleton,
} from '../skeleton/PostGridTileSkeleton';

export interface PostGridProps {
  posts: IPostResponse[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onDelete?: (post: IPostResponse) => Promise<void> | void;
  onToggleVisibility?: (post: IPostResponse) => Promise<void> | void;
  onRetry?: () => void;
  isOwner?: boolean;
  isError?: boolean;
  skeletonCount?: number;
  className?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
  scrollRef?: React.RefObject<HTMLElement | null>;
  forceCols?: ColCount;
  hideEndDivider?: boolean;
}

const PostGrid = ({
  posts,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  onDelete,
  onToggleVisibility,
  onRetry,
  isOwner = false,
  isError = false,
  skeletonCount = 8,
  className,
  emptyMessage = 'No posts yet',
  emptySubMessage = "When posts are added they'll appear here.",
  scrollRef: externalScrollRef,
  forceCols,
  hideEndDivider = false,
}: PostGridProps) => {
  const autoCols = useGridCols();
  const cols: ColCount = forceCols ?? autoCols;
  const internalScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = (externalScrollRef ??
    internalScrollRef) as React.RefObject<HTMLDivElement | null>;
  const [scrollMargin, setScrollMargin] = useState(0);

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

  const postRows = chunkIntoRows(posts, cols);

  const rows: PostRow[] = [
    ...postRows,
    ...(isFetchingNextPage
      ? (['skeleton'] as const)
      : !hasNextPage && posts.length > 0 && !hideEndDivider
        ? (['end'] as const)
        : []),
  ];

  const virtualizer = useVirtualGrid({
    count: rows.length,
    scrollRef,
    estimateSize: (i) => {
      const row = rows[i];
      if (row === 'skeleton' || row === 'end') return 80;
      return POST_TILE_HEIGHT_PX + ROW_GAP_PX;
    },
    scrollMargin: externalScrollRef ? scrollMargin : undefined,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
  });

  if (isLoading && posts.length === 0) {
    return <PostTileGridSkeleton count={skeletonCount} cols={cols} />;
  }

  if (isError && posts.length === 0) {
    return <PostErrorState onRetry={onRetry} />;
  }

  if (posts.length === 0) {
    return (
      <PostEmptyState message={emptyMessage} subMessage={emptySubMessage} />
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
              paddingBottom: `${ROW_GAP_PX}px`,
            }}
          >
            {row === 'skeleton' ? (
              <PostTileRowSkeleton cols={cols} />
            ) : row === 'end' ? (
              <PostEndDivider />
            ) : (
              <div className={`grid ${COL_CLASS[cols]} gap-4`}>
                {row.map((post) => (
                  <PostGridTile
                    key={post.id}
                    post={post}
                    isOwner={isOwner}
                    onDelete={onDelete}
                    onToggleVisibility={onToggleVisibility}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PostGrid;
