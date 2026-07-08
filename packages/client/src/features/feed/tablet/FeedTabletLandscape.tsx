import { useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useShort } from '../../short/useShort';
import ShortPlayer from '../../short/pages/ShortPlayer';
import VideoGrid from '../../video/pages/VideoGrid';
import PostGrid from '../../post/pages/PostGrid';
import PostCard from '../../post/pages/PostCard';
import { useLiveVideoFeed } from '../hooks/useLiveVideoFeed';
import { useLiveShortsFeed } from '../hooks/useLiveShortsFeed';
import { useLivePostFeed } from '../hooks/useLivePostFeed';
import { SHORTS_PREFETCH_THRESHOLD } from '../feedConfig';
import { buildFeedBlocks } from '../mobile/buildFeedBlocks';
import type { ColCount } from '../../../shared/utils/videoGrid';

const VIDEOS_PER_BLOCK = 6;
const POSTS_PER_BLOCK = 2;

const FeedTabletLandscape = () => {
  const { activeIndex, goNext, goPrev, updateCurrentShort } = useShort();
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const {
    items: videos,
    hasNextPage: hasNextVideoPage,
    isFetchingNextPage: videoLoading,
    isLoading: videosInitialLoading,
    isError: videosErrored,
    loadMore: loadMoreVideos,
    retry: retryVideos,
  } = useLiveVideoFeed();

  const {
    items: shorts,
    hasNextPage: hasNextShortsPage,
    isFetchingNextPage: shortsLoadingMore,
    loadMore: loadMoreShorts,
  } = useLiveShortsFeed();

  const {
    items: posts,
    hasNextPage: hasNextPostsPage,
    isFetchingNextPage: postsLoadingMore,
    loadMore: loadMorePosts,
  } = useLivePostFeed();

  const { ref: postsSentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPostsPage && !postsLoadingMore) {
        loadMorePosts();
      }
    },
  });

  useEffect(() => {
    updateCurrentShort(shorts[activeIndex] ?? null);
  }, [activeIndex, shorts]);

  useEffect(() => {
    if (
      hasNextShortsPage &&
      !shortsLoadingMore &&
      activeIndex >= shorts.length - SHORTS_PREFETCH_THRESHOLD
    ) {
      loadMoreShorts();
    }
  }, [
    activeIndex,
    shorts.length,
    hasNextShortsPage,
    shortsLoadingMore,
    loadMoreShorts,
  ]);

  useEffect(() => {
    mainScrollRef.current = document.querySelector('main');
  }, []);

  const handleShortNext = () => {
    if (activeIndex < shorts.length - 1 || hasNextShortsPage) {
      goNext();
    }
  };

  const { blocks, remainingPosts } = buildFeedBlocks(
    [],
    videos,
    posts,
    0,
    VIDEOS_PER_BLOCK,
    POSTS_PER_BLOCK
  );

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex items-start w-full">
        <div
          className="sticky shrink-0 self-start -mt-4 sm:-mt-6 lg:-mt-8 h-[calc(100vh-3.5rem-2rem)] sm:h-[calc(100vh-3.5rem-3rem)] lg:h-[calc(100vh-3.5rem-4rem)]"
          style={{
            top: 0,
            width: 'calc(22rem + 2rem)',
          }}
        >
          <div className="h-full pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 lg:pb-0 pl-4 sm:pl-6 lg:pl-8 pr-3">
            <ShortPlayer
              short={shorts[activeIndex] ?? null}
              activeIndex={activeIndex}
              total={shorts.length}
              onNext={handleShortNext}
              onPrev={goPrev}
              className="h-full"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 -mt-4 sm:-mt-6 lg:-mt-8 pt-4 sm:pt-6 lg:pt-8 px-4 sm:px-6 lg:px-8 pl-0 flex flex-col gap-5">
          {videosInitialLoading && videos.length === 0 ? (
            <VideoGrid
              videos={[]}
              isLoading
              forceCols={2 as ColCount}
              scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
            />
          ) : videosErrored && videos.length === 0 ? (
            <VideoGrid
              videos={[]}
              isError
              onRetry={retryVideos}
              forceCols={2 as ColCount}
              scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
            />
          ) : (
            blocks.map((block, blockIdx) => {
              if (block.type === 'shorts') return null;

              if (block.type === 'posts') {
                if (block.items.length === 0) return null;
                return (
                  <PostGrid
                    key={`posts-${blockIdx}`}
                    posts={block.items}
                    scrollRef={
                      mainScrollRef as React.RefObject<HTMLElement | null>
                    }
                    hideEndDivider
                  />
                );
              }

              const blockVideos = videos.slice(
                block.startVideo,
                block.endVideo
              );
              if (blockVideos.length === 0) return null;

              return (
                <VideoGrid
                  key={`videos-${blockIdx}`}
                  videos={blockVideos}
                  hasNextPage={block.isLast ? hasNextVideoPage : false}
                  isFetchingNextPage={block.isLast ? videoLoading : false}
                  onLoadMore={block.isLast ? loadMoreVideos : undefined}
                  scrollRef={
                    mainScrollRef as React.RefObject<HTMLElement | null>
                  }
                  forceCols={2 as ColCount}
                  hideEndDivider={!block.isLast}
                />
              );
            })
          )}
        </div>
      </div>

      {remainingPosts.length > 0 && (
        <div className="flex flex-col gap-4 px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
            More Posts
          </p>
          {remainingPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {hasNextPostsPage && (
            <div ref={postsSentinelRef} className="h-4" aria-hidden />
          )}
        </div>
      )}
    </div>
  );
};

export default FeedTabletLandscape;
