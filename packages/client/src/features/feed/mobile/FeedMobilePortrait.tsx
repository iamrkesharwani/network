import { useEffect, useRef, useState } from 'react';
import { useShort } from '../../short/useShort';
import {
  ALL_SHORTS,
  ALL_VIDEOS,
  VIDEO_PAGE_SIZE,
} from '../__dev__/feedMockData';
import { buildFeedBlocks } from './buildFeedBlocks';
import ShortThumbnail from './ShortThumbnail';
import VideoGrid from '../../video/pages/VideoGrid';

const SHORTS_PER_BLOCK = 2;
const VIDEOS_PER_BLOCK = 6;

const FeedMobilePortrait = () => {
  const { activeIndex, goToIndex } = useShort();
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const [videoPage, setVideoPage] = useState(1);
  const [videoLoading, setVideoLoading] = useState(false);
  const visibleVideos = ALL_VIDEOS.slice(0, videoPage * VIDEO_PAGE_SIZE);
  const hasNextVideoPage = visibleVideos.length < ALL_VIDEOS.length;

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

  const { blocks, remainingShorts, shortsInBlocks } = buildFeedBlocks(
    ALL_SHORTS,
    ALL_VIDEOS,
    SHORTS_PER_BLOCK,
    VIDEOS_PER_BLOCK
  );

  return (
    <div className="flex flex-col gap-5 w-full">
      {blocks.map((block, blockIdx) => {
        if (block.type === 'shorts') {
          return (
            <div key={`shorts-${blockIdx}`} className="grid grid-cols-2 gap-3">
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

        const blockVideos = visibleVideos.slice(
          block.startVideo,
          block.endVideo
        );

        if (blockVideos.length === 0) return null;

        return (
          <VideoGrid
            key={`video-${blockIdx}`}
            videos={blockVideos}
            hasNextPage={block.isLast ? hasNextVideoPage : false}
            isFetchingNextPage={block.isLast ? videoLoading : false}
            onLoadMore={block.isLast ? handleLoadMore : undefined}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedMobilePortrait;
