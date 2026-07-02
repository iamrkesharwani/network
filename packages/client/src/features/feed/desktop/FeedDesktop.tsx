import { useRef, useEffect } from 'react';
import { useShort } from '../../short/useShort';
import ShortPlayer from '../../short/pages/ShortPlayer';
import VideoGrid from '../../video/pages/VideoGrid';
import { useLiveVideoFeed } from '../hooks/useLiveVideoFeed';
import { useLiveShortsFeed } from '../hooks/useLiveShortsFeed';
import { SHORTS_PREFETCH_THRESHOLD } from '../feedConfig';
import type { ColCount } from '../../../shared/utils/videoGrid';

const FeedDesktop = () => {
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

  return (
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

      <div className="flex-1 min-w-0 -mt-4 sm:-mt-6 lg:-mt-8 pt-4 sm:pt-6 lg:pt-8 px-4 sm:px-6 lg:px-8 pl-0">
        <VideoGrid
          videos={videos}
          isLoading={videosInitialLoading}
          isError={videosErrored}
          onRetry={retryVideos}
          hasNextPage={hasNextVideoPage}
          isFetchingNextPage={videoLoading}
          onLoadMore={loadMoreVideos}
          scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
          forceCols={3 as ColCount}
        />
      </div>
    </div>
  );
};

export default FeedDesktop;
