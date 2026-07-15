import InfiniteScroll from '../../../shared/ui/list/InfiniteScroll';
import VideoErrorState from '../../video/components/VideoErrorState';
import VideoEmptyState from '../../video/components/VideoEmptyState';
import Skeleton from '../../../shared/ui/skeleton/Skeleton';
import CreatorResultCard from './CreatorResultCard';
import { useLiveSearchCreators } from '../hooks/useLiveSearchCreators';

interface SearchCreatorResultsProps {
  q: string;
}

const SearchCreatorResults = ({ q }: SearchCreatorResultsProps) => {
  const {
    items,
    isLoading,
    isFetchingNextPage,
    isError,
    hasNextPage,
    loadMore,
    retry,
  } = useLiveSearchCreators(q);

  if (isLoading && items.length === 0) {
    return (
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError && items.length === 0) {
    return <VideoErrorState onRetry={retry} />;
  }

  if (items.length === 0) {
    return (
      <VideoEmptyState
        message={`No creators found for "${q}"`}
        subMessage="Try a different search term."
      />
    );
  }

  return (
    <InfiniteScroll
      isLoading={isFetchingNextPage}
      hasMore={hasNextPage}
      onLoadMore={loadMore}
    >
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((creator) => (
          <CreatorResultCard key={creator.id} creator={creator} />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default SearchCreatorResults;
