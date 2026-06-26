import { useEffect, useRef, type ReactNode } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import Spinner from './Spinner';

export interface InfiniteScrollProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  children: ReactNode;
  loadingIndicator?: ReactNode;
  endMessage?: ReactNode;
  className?: string;
}

const InfiniteScroll = ({
  isLoading,
  hasMore,
  onLoadMore,
  children,
  loadingIndicator,
  endMessage,
  className = '',
}: InfiniteScrollProps) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const entry = useIntersectionObserver(loadMoreRef, {
    threshold: 0.1,
    rootMargin: '400px',
  });

  useEffect(() => {
    if (entry?.isIntersecting && !isLoading && hasMore) {
      onLoadMore();
    }
  }, [entry?.isIntersecting, isLoading, hasMore, onLoadMore]);

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {children}
      <div
        ref={loadMoreRef}
        className="w-full flex justify-center items-center py-6 min-h-15"
      >
        {isLoading &&
          (loadingIndicator || (
            <Spinner size="md" className="text-text-muted" />
          ))}

        {!hasMore && !isLoading && endMessage && (
          <span className="text-sm text-text-muted font-medium py-2">
            {endMessage}
          </span>
        )}
      </div>
    </div>
  );
};

export default InfiniteScroll;
