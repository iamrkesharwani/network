import { useRef } from 'react';
import type { IPostResponse } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { useVirtualGrid } from '../../../shared/hooks/useVirtualGrid';
import PostCard from './PostCard';
import PostEmptyState from '../components/PostEmptyState';
import PostErrorState from '../components/PostErrorState';
import PostEndDivider from '../components/PostEndDivider';
import {
  PostGridSkeleton,
  PostRowSkeleton,
} from '../../../shared/skeleton/post/PostGridSkeleton';

type PostRow = IPostResponse | 'skeleton' | 'end';

export interface PostGridProps {
  posts: IPostResponse[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onEdit?: (post: IPostResponse) => void;
  onDelete?: (post: IPostResponse) => void;
  onRetry?: () => void;
  isOwner?: boolean;
  isError?: boolean;
  skeletonCount?: number;
  className?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
  scrollRef?: React.RefObject<HTMLElement | null>;
}

const estimatePostHeight = (post: IPostResponse): number => {
  const textLen = post.text?.length ?? 0;
  const hasMedia = post.mediaType !== 'none';
  return 92 + Math.min(textLen, 280) * 0.42 + (hasMedia ? 300 : 0);
};

const PostGrid = ({
  posts,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onLoadMore,
  onEdit,
  onDelete,
  onRetry,
  isOwner = false,
  isError = false,
  skeletonCount = 5,
  className,
  emptyMessage = 'No posts yet',
  emptySubMessage = "When posts are added they'll appear here.",
  scrollRef: externalScrollRef,
}: PostGridProps) => {
  const internalScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = (externalScrollRef ??
    internalScrollRef) as React.RefObject<HTMLDivElement | null>;

  const rows: PostRow[] = [
    ...posts,
    ...(isFetchingNextPage
      ? (['skeleton'] as const)
      : !hasNextPage && posts.length > 0
        ? (['end'] as const)
        : []),
  ];

  const virtualizer = useVirtualGrid({
    count: rows.length,
    scrollRef,
    estimateSize: (i) => {
      const row = rows[i];
      if (row === 'skeleton' || row === 'end') return 80;
      return estimatePostHeight(row);
    },
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
  });

  if (isLoading && posts.length === 0) {
    return <PostGridSkeleton count={skeletonCount} />;
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
      className={cn('w-full max-w-2xl mx-auto relative', className)}
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
              paddingBottom: '16px',
            }}
          >
            {row === 'skeleton' ? (
              <PostRowSkeleton />
            ) : row === 'end' ? (
              <PostEndDivider />
            ) : (
              <PostCard
                post={row}
                isOwner={isOwner}
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

export default PostGrid;
