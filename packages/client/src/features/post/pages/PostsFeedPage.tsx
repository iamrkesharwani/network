import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { DEFAULT_PAGE_LIMIT, type FeedColumnCount } from '@network/shared';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import InfiniteScroll from '../../../shared/ui/list/InfiniteScroll';
import { useLiveFeed } from '../../feed/hooks/useLiveFeed';
import { COL_CLASS, type ColCount } from '../../video/utils/videoGrid';
import { useGetPostByIdQuery, postApi } from '../postApi';
import PostGridTile from './PostGridTile';
import PostCard from './PostCard';
import PostEmptyState from '../components/PostEmptyState';
import PostErrorState from '../components/PostErrorState';
import { PostTileGridSkeleton } from '../skeleton/PostGridTileSkeleton';
import { useFeedColumns } from '../../feed/hooks/useFeedColumns';
import CommentSection from '../../engagement/components/CommentSection';

const PostsFeedPage = () => {
  const { postId } = useParams<{ postId?: string }>();
  const { postsPerBlock } = useFeedColumns(false);

  const {
    data: pinnedData,
    isLoading: isPinnedLoading,
    isError: isPinnedError,
  } = useGetPostByIdQuery(postId ?? '', { skip: !postId });
  const pinnedPost = postId ? pinnedData?.data : undefined;

  usePageTitle(pinnedPost ? `Post by @${pinnedPost.author.username}` : 'Posts');

  const {
    items,
    isLoading,
    isFetchingNextPage,
    isError,
    hasNextPage,
    loadMore,
    retry,
  } = useLiveFeed((args) => postApi.useGetFeedQuery(args), DEFAULT_PAGE_LIMIT);

  const continuation = pinnedPost
    ? items.filter((item) => item.id !== pinnedPost.id)
    : items;

  if (postId && isPinnedLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
      </div>
    );
  }

  if (postId && (isPinnedError || !pinnedPost)) {
    return (
      <PostEmptyState
        message="This post couldn't be found"
        subMessage="It may have been removed."
      />
    );
  }

  if (!pinnedPost && isLoading && items.length === 0) {
    return (
      <PostTileGridSkeleton
        count={postsPerBlock}
        cols={postsPerBlock as ColCount}
      />
    );
  }

  if (!pinnedPost && isError && items.length === 0) {
    return <PostErrorState onRetry={retry} />;
  }

  if (!pinnedPost && items.length === 0) {
    return (
      <PostEmptyState
        message="No posts yet"
        subMessage="When posts are added they'll appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {pinnedPost && (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <PostCard post={pinnedPost} />
          <CommentSection contentType="post" contentId={pinnedPost.id} />
        </div>
      )}

      <InfiniteScroll
        isLoading={isFetchingNextPage}
        hasMore={hasNextPage}
        onLoadMore={loadMore}
      >
        <div
          className={`grid gap-4 ${COL_CLASS[postsPerBlock as FeedColumnCount]}`}
        >
          {continuation.map((item) => (
            <PostGridTile key={item.id} post={item} variant="detail" />
          ))}
        </div>
      </InfiniteScroll>

      {pinnedPost && isError && continuation.length === 0 && (
        <PostErrorState onRetry={retry} />
      )}
      {pinnedPost &&
        !isError &&
        continuation.length === 0 &&
        !isFetchingNextPage &&
        !hasNextPage && (
          <PostEmptyState
            message="No more posts"
            subMessage="You've seen everything for now."
          />
        )}
    </div>
  );
};

export default PostsFeedPage;
