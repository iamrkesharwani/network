import { useState, useRef, useEffect } from 'react';
import { useShort } from '../short/useShort';
import VideoGrid from '../video/pages/VideoGrid';
import {
  ALL_SHORTS,
  ALL_VIDEOS,
  VIDEO_PAGE_SIZE,
} from './__dev__/feedMockData';
import type { IShortResponse } from '@network/shared';

const SHORTS_PER_BLOCK = 2;
const VIDEOS_PER_BLOCK = 6;

const ShortThumbnail = ({
  short,
  isActive,
  onClick,
}: {
  short: IShortResponse;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative w-full aspect-9/16 rounded-xl overflow-hidden bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  >
    {short.thumbnailUrl && (
      <img
        src={short.thumbnailUrl}
        alt={short.title}
        draggable={false}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    )}
    <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent pointer-events-none" />
    <p className="absolute bottom-2 left-2 right-2 text-[11px] font-medium text-white leading-tight line-clamp-2">
      {short.title}
    </p>
    {isActive && (
      <div className="absolute inset-0 ring-2 ring-primary rounded-xl pointer-events-none" />
    )}
  </button>
);

const FeedMobile = () => {
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

  // Only generate as many shorts+video block pairs as there are video blocks.
  // Remaining shorts go into a horizontal scroll strip at the bottom.
  const totalVideoBlocks = Math.ceil(ALL_VIDEOS.length / VIDEOS_PER_BLOCK);
  const shortsInBlocks = totalVideoBlocks * SHORTS_PER_BLOCK;
  const remainingShorts = ALL_SHORTS.slice(shortsInBlocks);

  type Block =
    | { type: 'shorts'; items: IShortResponse[]; startIndex: number }
    | { type: 'videos'; startVideo: number; endVideo: number; isLast: boolean };

  const blocks: Block[] = [];
  for (let i = 0; i < totalVideoBlocks; i++) {
    const shortsStart = i * SHORTS_PER_BLOCK;
    blocks.push({
      type: 'shorts',
      items: ALL_SHORTS.slice(shortsStart, shortsStart + SHORTS_PER_BLOCK),
      startIndex: shortsStart,
    });
    blocks.push({
      type: 'videos',
      startVideo: i * VIDEOS_PER_BLOCK,
      endVideo: (i + 1) * VIDEOS_PER_BLOCK,
      isLast: i === totalVideoBlocks - 1,
    });
  }

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
            key={`videos-${blockIdx}`}
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

      {/* Remaining shorts — horizontal scroll strip for engagement */}
      {remainingShorts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
            More Shorts
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {remainingShorts.map((short, i) => {
              const globalIndex = shortsInBlocks + i;
              return (
                <button
                  key={short.id}
                  type="button"
                  onClick={() => goToIndex(globalIndex)}
                  className="group relative shrink-0 w-28 aspect-9/16 rounded-xl overflow-hidden bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {short.thumbnailUrl && (
                    <img
                      src={short.thumbnailUrl}
                      alt={short.title}
                      draggable={false}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent pointer-events-none" />
                  <p className="absolute bottom-2 left-2 right-2 text-[10px] font-medium text-white leading-tight line-clamp-2">
                    {short.title}
                  </p>
                  {activeIndex === globalIndex && (
                    <div className="absolute inset-0 ring-2 ring-primary rounded-xl pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedMobile;
