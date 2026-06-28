import { useEffect, useRef, useState } from 'react';
import { useShort } from '../../short/useShort';
import {
  ALL_SHORTS,
  ALL_VIDEOS,
  VIDEO_PAGE_SIZE,
} from '../__dev__/feedMockData';
import ShortsRail from './ShortsRail';
import VideoGrid from '../../video/pages/VideoGrid';

const FeedTabletPortrait = () => {
  const { activeIndex, updateCurrentShort } = useShort();
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const [videoPage, setVideoPage] = useState(1);
  const [videoLoading, setVideoLoading] = useState(false);
  const videos = ALL_VIDEOS.slice(0, videoPage * VIDEO_PAGE_SIZE);
  const hasNextVideoPage = videos.length < ALL_VIDEOS.length;

  const firstPageVideos = videos.slice(0, VIDEO_PAGE_SIZE);
  const restVideos = videos.slice(VIDEO_PAGE_SIZE);

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
        className="sticky shrink-0 self-start w-44"
        style={{ top: 0, height: '70vh' }}
      >
        <div className="h-full pl-4 sm:pl-6 py-4 sm:py-6 pr-3">
          <ShortsRail className="h-full" />
        </div>
      </div>

      <div className="flex-1 min-w-0 px-4 sm:px-6 py-4 sm:py-6 pl-0 flex flex-col gap-5">
        <VideoGrid
          videos={firstPageVideos}
          hasNextPage={false}
          isFetchingNextPage={false}
          scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
          forceCols={1}
          hideEndDivider
        />
        {restVideos.length > 0 && (
          <VideoGrid
            videos={restVideos}
            hasNextPage={hasNextVideoPage}
            isFetchingNextPage={videoLoading}
            onLoadMore={handleLoadMore}
            scrollRef={mainScrollRef as React.RefObject<HTMLElement | null>}
            forceCols={2}
          />
        )}
      </div>
    </div>
  );
};

export default FeedTabletPortrait;
