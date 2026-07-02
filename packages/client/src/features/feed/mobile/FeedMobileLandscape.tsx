import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useShort } from '../../short/useShort';
import VideoGrid from '../../video/pages/VideoGrid';
import ShortThumbnail from './ShortThumbnail';
import { buildFeedBlocks } from './buildFeedBlocks';
import { useLiveVideoFeed } from '../hooks/useLiveVideoFeed';
import { useLiveShortsFeed } from '../hooks/useLiveShortsFeed';

const SHORTS_PER_BLOCK = 4;
const VIDEOS_PER_BLOCK = 6;

const FeedMobileLandscape = () => {
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

  const { ref: shortsSentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextShortsPage && !shortsLoadingMore) {
        loadMoreShorts();
      }
    },
  });

  useEffect(() => {
    mainScrollRef.current = document.querySelector('main');
  }, []);

  const { blocks, remainingShorts, shortsInBlocks } = buildFeedBlocks(
    shorts,
    videos,
    SHORTS_PER_BLOCK,
    VIDEOS_PER_BLOCK
  );

  return (
    <div className="flex flex-col gap-5 w-full">
      {videosInitialLoading && videos.length === 0 ? (
        <VideoGrid
          videos={[]}
          isLoading
          forceCols={2}
          scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
        />
      ) : videosErrored && videos.length === 0 ? (
        <VideoGrid
          videos={[]}
          isError
          onRetry={retryVideos}
          forceCols={2}
          scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
        />
      ) : (
        <>
          {blocks.map((block, blockIdx) => {
            if (block.type === 'shorts') {
              return (
                <div
                  key={`shorts-${blockIdx}`}
                  className="grid grid-cols-4 gap-3"
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

            const blockVideos = videos.slice(block.startVideo, block.endVideo);
            if (blockVideos.length === 0) return null;

            return (
              <VideoGrid
                key={`videos-${blockIdx}`}
                videos={blockVideos}
                hasNextPage={block.isLast ? hasNextVideoPage : false}
                isFetchingNextPage={block.isLast ? videoLoading : false}
                onLoadMore={block.isLast ? loadMoreVideos : undefined}
                scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
                forceCols={2}
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
        </>
      )}
    </div>
  );
};

export default FeedMobileLandscape;
