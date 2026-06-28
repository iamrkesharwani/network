import { useRef, useState, useEffect } from 'react';
import { useShort } from '../short/useShort';
import ShortPlayer from '../short/pages/ShortPlayer';
import VideoGrid from '../video/pages/VideoGrid';
import {
  ALL_SHORTS,
  ALL_VIDEOS,
  VIDEO_PAGE_SIZE,
} from './__dev__/feedMockData';
import type { ColCount } from '../../shared/utils/videoGrid';

const FeedDesktop = () => {
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
      {/* Short player — sticky, full viewport height minus navbar, own padding */}
      <div
        className="sticky shrink-0 self-start"
        style={{
          top: 0,
          height: 'calc(100vh - 3.5rem)',
          width: 'calc(22rem + 2rem)',
        }}
      >
        <div className="h-full pl-4 sm:pl-6 lg:pl-8 py-4 sm:py-6 lg:py-8 pr-3">
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

      {/* Video grid — scrolls with main, own padding */}
      <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pl-0">
        <VideoGrid
          videos={videos}
          hasNextPage={hasNextVideoPage}
          isFetchingNextPage={videoLoading}
          onLoadMore={handleLoadMore}
          scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
          forceCols={3 as ColCount}
        />
      </div>
    </div>
  );
};

export default FeedDesktop;
