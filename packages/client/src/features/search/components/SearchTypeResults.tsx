import {
  CLIENT_ROUTES,
  type FeedColumnCount,
  type IPostResponse,
  type IShortResponse,
  type IVideoResponse,
  type SearchType,
} from '@network/shared';
import { useNavigate } from 'react-router-dom';
import { COL_CLASS } from '../../video/utils/videoGrid';
import { SHORT_COL_CLASS } from '../../short/utils/shortGrid';
import { useFeedColumns } from '../../feed/hooks/useFeedColumns';
import { useLiveSearchByType } from '../hooks/useLiveSearchByType';
import VideoCard from '../../video/pages/VideoCard';
import ShortRailCard from '../../short/components/ShortRailCard';
import PostGridTile from '../../post/pages/PostGridTile';
import VideoCardSkeleton from '../../video/skeleton/VideoCardSkeleton';
import ShortCardSkeleton from '../../short/skeleton/ShortCardSkeleton';
import VideoErrorState from '../../video/components/VideoErrorState';
import VideoEmptyState from '../../video/components/VideoEmptyState';
import InfiniteScroll from '../../../shared/ui/list/InfiniteScroll';

interface SearchTypeResultsProps {
  q: string;
  type: SearchType;
}

const SearchTypeResults = ({ q, type }: SearchTypeResultsProps) => {
  const navigate = useNavigate();
  const { columns, shortsPerBlock, postsPerBlock } = useFeedColumns(false);
  const gridClass =
    type === 'short'
      ? SHORT_COL_CLASS[shortsPerBlock]
      : type === 'post'
        ? COL_CLASS[postsPerBlock as FeedColumnCount]
        : COL_CLASS[columns];

  const {
    items,
    isLoading,
    isFetchingNextPage,
    isError,
    hasNextPage,
    loadMore,
    retry,
  } = useLiveSearchByType(q, type);

  const shorts = items as IShortResponse[];

  const handleShortClick = (short: IShortResponse) => {
    navigate(CLIENT_ROUTES.SHORT_WATCH.replace(':shortId', short.id));
  };

  if (isLoading && items.length === 0) {
    const SkeletonCard =
      type === 'short' ? ShortCardSkeleton : VideoCardSkeleton;
    return (
      <div className={`grid gap-4 ${gridClass}`}>
        {Array.from(
          { length: type === 'short' ? shortsPerBlock : columns * 2 },
          (_, i) => (
            <SkeletonCard key={i} />
          )
        )}
      </div>
    );
  }

  if (isError && items.length === 0) {
    return <VideoErrorState onRetry={retry} />;
  }

  if (items.length === 0) {
    return (
      <VideoEmptyState
        message={`No ${type}s found for "${q}"`}
        subMessage="Try a different search term."
      />
    );
  }

  return (
    <>
      <InfiniteScroll
        isLoading={isFetchingNextPage}
        hasMore={hasNextPage}
        onLoadMore={loadMore}
      >
        <div className={`grid gap-4 ${gridClass}`}>
          {type === 'video' &&
            items.map((item) => (
              <VideoCard key={item.id} video={item as IVideoResponse} />
            ))}
          {type === 'short' &&
            shorts.map((short) => (
              <ShortRailCard
                key={short.id}
                short={short}
                onClick={handleShortClick}
              />
            ))}
          {type === 'post' &&
            items.map((item) => (
              <PostGridTile key={item.id} post={item as IPostResponse} />
            ))}
        </div>
      </InfiniteScroll>
    </>
  );
};

export default SearchTypeResults;
