import { useEffect, useRef } from 'react';
import usePageTitle from '../../../shared/hooks/usePageTitle';
import { useLivePostFeed } from '../../feed/hooks/useLivePostFeed';
import PostGrid from './PostGrid';

const PostsFeedPage = () => {
  usePageTitle('Posts');
  const mainScrollRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    mainScrollRef.current = document.querySelector('main');
  }, []);

  const {
    items: posts,
    isLoading,
    isFetchingNextPage,
    isError,
    hasNextPage,
    loadMore,
    retry,
  } = useLivePostFeed();

  return (
    <PostGrid
      posts={posts}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      isError={isError}
      hasNextPage={hasNextPage}
      onLoadMore={loadMore}
      onRetry={retry}
      scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
    />
  );
};

export default PostsFeedPage;
