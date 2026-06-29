import { useRef, useState, useEffect } from 'react';
import { useShort } from '../../short/useShort';
import ShortPlayer from '../../short/pages/ShortPlayer';
import VideoGrid from '../../video/pages/VideoGrid';
import {
  ALL_SHORTS,
  ALL_VIDEOS,
  VIDEO_PAGE_SIZE,
} from '../__dev__/feedMockData';
import type { ColCount } from '../../../shared/utils/videoGrid';

const FeedTabletPortrait = () => {
  const { activeIndex, goNext, goPrev, updateCurrentShort } = useShort();
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const [videoPage, setVideoPage] = useState(1);
  const [videoLoading, setVideoLoading] = useState(false);
  const videos = ALL_VIDEOS.slice(0, videoPage * VIDEO_PAGE_SIZE);
  const hasNextVideoPage = videos.length < ALL_VIDEOS.length;

  useEffect(() => {
    updateCurrentShort(ALL_SHORTS[activeIndex] ?? null);
  }, [activeIndex]);

  useEffect(() => {
    mainScrollRef.current = document.querySelector('main');
  }, []);

  const handleLoadMore = () => {
    setVideoLoading(true);
    setTimeout(() => {
      setVideoPage((p) => p + 1);
      setVideoLoading(false);
    }, 800);
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
            short={ALL_SHORTS[activeIndex] ?? null}
            activeIndex={activeIndex}
            total={ALL_SHORTS.length}
            onNext={goNext}
            onPrev={goPrev}
            className="h-full"
          />
        </div>
      </div>

      <div className="flex-1 min-w-0 -mt-4 sm:-mt-6 lg:-mt-8 pt-4 sm:pt-6 lg:pt-8 px-4 sm:px-6 lg:px-8 pl-0">
        <VideoGrid
          videos={videos}
          hasNextPage={hasNextVideoPage}
          isFetchingNextPage={videoLoading}
          onLoadMore={handleLoadMore}
          scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
          forceCols={1 as ColCount}
        />
      </div>
    </div>
  );
};

export default FeedTabletPortrait;
