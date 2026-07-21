import { DEFAULT_PAGE_LIMIT } from '@network/shared';
import InfiniteScroll from '../../../shared/ui/list/InfiniteScroll';
import { useLiveFeed } from '../../feed/hooks/useLiveFeed';
import { useFeedColumns } from '../../feed/hooks/useFeedColumns';
import { COL_CLASS, type ColCount } from '../../video/utils/videoGrid';
import { postApi } from '../postApi';
import PostGridTile from '../pages/PostGridTile';
import PostEmptyState from './PostEmptyState';
import PostErrorState from './PostErrorState';
import { PostTileGridSkeleton } from '../skeleton/PostGridTileSkeleton';

interface PostContinuationFeedProps {
  excludeId?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
}

const PostContinuationFeed = ({
  excludeId,
  emptyMessage = 'No posts yet',
  emptySubMessage = "When posts are added they'll appear here.",
}: PostContinuationFeedProps) => {
  const { postsPerBlock } = useFeedColumns(false);
  const cols = postsPerBlock as ColCount;

  const {
    items,
    isLoading,
    isFetchingNextPage,
    isError,
    hasNextPage,
    loadMore,
    retry,
  } = useLiveFeed((args) => postApi.useGetFeedQuery(args), DEFAULT_PAGE_LIMIT);

  const posts = excludeId
    ? items.filter((item) => item.id !== excludeId)
    : items;

  if (isLoading && items.length === 0) {
    return <PostTileGridSkeleton count={postsPerBlock} cols={cols} />;
  }

  if (isError && items.length === 0) {
    return <PostErrorState onRetry={retry} />;
  }

  if (posts.length === 0 && !isFetchingNextPage && !hasNextPage) {
    return (
      <PostEmptyState message={emptyMessage} subMessage={emptySubMessage} />
    );
  }

  return (
    <InfiniteScroll
      isLoading={isFetchingNextPage}
      hasMore={hasNextPage}
      onLoadMore={loadMore}
    >
      <div className={`grid gap-4 ${COL_CLASS[cols]}`}>
        {posts.map((item) => (
          <PostGridTile key={item.id} post={item} />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default PostContinuationFeed;
