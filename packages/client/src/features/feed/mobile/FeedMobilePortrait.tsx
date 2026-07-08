import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useShort } from '../../short/useShort';
import { useLiveVideoFeed } from '../hooks/useLiveVideoFeed';
import { useLiveShortsFeed } from '../hooks/useLiveShortsFeed';
import { useLivePostFeed } from '../hooks/useLivePostFeed';
import { buildFeedBlocks } from './buildFeedBlocks';
import ShortThumbnail from './ShortThumbnail';
import VideoGrid from '../../video/pages/VideoGrid';
import PostGrid from '../../post/pages/PostGrid';
import PostCard from '../../post/pages/PostCard';

const SHORTS_PER_BLOCK = 2;
const VIDEOS_PER_BLOCK = 6;
const POSTS_PER_BLOCK = 2;

const FeedMobilePortrait = () => {
  const { activeIndex, goToIndex } = useShort();
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

  const { ref: shortsSentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextShortsPage && !shortsLoadingMore) {
        loadMoreShorts();
      }
    },
  });

  const { ref: postsSentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPostsPage && !postsLoadingMore) {
        loadMorePosts();
      }
    },
  });

  useEffect(() => {
    mainScrollRef.current = document.querySelector('main');
  }, []);

  const { blocks, remainingShorts, shortsInBlocks, remainingPosts } =
    buildFeedBlocks(
      shorts,
      videos,
      posts,
      SHORTS_PER_BLOCK,
      VIDEOS_PER_BLOCK,
      POSTS_PER_BLOCK
    );

  return (
    <div className="flex flex-col gap-5 w-full">
      {videosInitialLoading && videos.length === 0 ? (
        <VideoGrid
          videos={[]}
          isLoading
          forceCols={1}
          scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
        />
      ) : videosErrored && videos.length === 0 ? (
        <VideoGrid
          videos={[]}
          isError
          onRetry={retryVideos}
          forceCols={1}
          scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
        />
      ) : (
        <>
          {blocks.map((block, blockIdx) => {
            if (block.type === 'shorts') {
              if (block.items.length === 0) return null;
              return (
                <div
                  key={`shorts-${blockIdx}`}
                  className="grid grid-cols-2 gap-3"
                >
                  {block.items.map((short, i) => {
                    const globalIndex = block.startIndex + i;
                    return (
                      <ShortThumbnail
                        key={short.id}
                        short={short}
                        isActive={activeIndex === globalIndex}
                        onClick={() => goToIndex(globalIndex)}
                      />
                    );
                  })}
                </div>
              );
            }

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

            const blockVideos = videos.slice(block.startVideo, block.endVideo);

            if (blockVideos.length === 0) return null;

            return (
              <VideoGrid
                key={`video-${blockIdx}`}
                videos={blockVideos}
                hasNextPage={block.isLast ? hasNextVideoPage : false}
                isFetchingNextPage={block.isLast ? videoLoading : false}
                onLoadMore={block.isLast ? loadMoreVideos : undefined}
                scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
                forceCols={1}
                hideEndDivider={!block.isLast}
              />
            );
          })}

          {remainingShorts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                More Shorts
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {remainingShorts.map((short, i) => {
                  const globalIndex = shortsInBlocks + i;
                  return (
                    <ShortThumbnail
                      key={short.id}
                      short={short}
                      isActive={activeIndex === globalIndex}
                      onClick={() => goToIndex(globalIndex)}
                      className="shrink-0 w-28"
                      titleClassName="text-[10px]"
                    />
                  );
                })}
                {hasNextShortsPage && (
                  <div
                    ref={shortsSentinelRef}
                    className="shrink-0 w-4 h-full"
                    aria-hidden
                  />
                )}
              </div>
            </div>
          )}

          {remainingPosts.length > 0 && (
            <div className="flex flex-col gap-4">
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
        </>
      )}
    </div>
  );
};

export default FeedMobilePortrait;
