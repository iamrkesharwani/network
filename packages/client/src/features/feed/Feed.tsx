import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import {
  CHAT_RAIL_WIDTH_PX,
  CLIENT_ROUTES,
  SHORTS_PREFETCH_THRESHOLD,
  SHORT_THEATER_WIDTH_PX,
  type IShortResponse,
  type IVideoResponse,
} from '@network/shared';
import usePageTitle from '../../shared/hooks/usePageTitle';
import { useIsMobileLayout } from '../../shared/hooks/useIsMobileLayout';
import { COL_CLASS } from '../video/utils/videoGrid';
import { SHORT_COL_CLASS } from '../short/utils/shortGrid';
import VideoCard from '../video/pages/VideoCard';
import ShortRailCard from '../short/components/ShortRailCard';
import ShortPlayer from '../short/pages/ShortPlayer';
import { useShort } from '../short/useShort';
import FeedSkeleton from './skeleton/FeedSkeleton';
import VideoCardSkeleton from '../video/skeleton/VideoCardSkeleton';
import VideoEmptyState from '../video/components/VideoEmptyState';
import VideoErrorState from '../video/components/VideoErrorState';
import { useLiveVideoFeed } from './hooks/useLiveVideoFeed';
import { useLiveShortsFeed } from './hooks/useLiveShortsFeed';
import { useFeedColumns, type FeedWidthMode } from './hooks/useFeedColumns';

const WIDTH_MODE_CLASS: Record<FeedWidthMode, string> = {
  full: '',
  edge: '-mx-4 sm:-mx-6 lg:-mx-8',
};

const isChatOpen = false;

type FeedBlock =
  | { type: 'video'; items: IVideoResponse[] }
  | { type: 'shorts'; items: IShortResponse[] };

const buildFeedBlocks = (
  videos: IVideoResponse[],
  shorts: IShortResponse[],
  firstVideoBlockSize: number,
  videosPerBlock: number,
  shortsPerBlock: number
): FeedBlock[] => {
  const blocks: FeedBlock[] = [];
  let videoIndex = 0;
  let shortIndex = 0;
  let isFirstVideoBlock = true;

  while (videoIndex < videos.length || shortIndex < shorts.length) {
    if (videoIndex < videos.length) {
      const blockSize = isFirstVideoBlock
        ? firstVideoBlockSize
        : videosPerBlock;
      blocks.push({
        type: 'video',
        items: videos.slice(videoIndex, videoIndex + blockSize),
      });
      videoIndex += blockSize;
      isFirstVideoBlock = false;
    }

    if (shortIndex < shorts.length) {
      blocks.push({
        type: 'shorts',
        items: shorts.slice(shortIndex, shortIndex + shortsPerBlock),
      });
      shortIndex += shortsPerBlock;
    }
  }

  return blocks;
};

const Feed = () => {
  usePageTitle('Feed');
  const navigate = useNavigate();
  const isMobileLayout = useIsMobileLayout();
  const {
    columns,
    widthMode,
    showChatRail,
    firstVideoBlockSize,
    videosPerBlock,
    shortsPerBlock,
  } = useFeedColumns(isChatOpen);

  const [theaterOpen, setTheaterOpen] = useState(false);
  const { activeIndex, goToIndex, goNext, goPrev, updateCurrentShort } =
    useShort();

  const {
    items: videos,
    isLoading: videosInitialLoading,
    isFetchingNextPage: videosFetching,
    isError: videosErrored,
    hasNextPage: hasMoreVideos,
    loadMore: loadMoreVideos,
    retry: retryVideos,
  } = useLiveVideoFeed();

  const {
    items: shorts,
    hasNextPage: hasMoreShorts,
    isFetchingNextPage: shortsFetching,
    loadMore: loadMoreShorts,
  } = useLiveShortsFeed();

  useEffect(() => {
    if (theaterOpen) {
      updateCurrentShort(shorts[activeIndex] ?? null);
    }
  }, [theaterOpen, activeIndex, shorts, updateCurrentShort]);

  useEffect(() => {
    if (
      theaterOpen &&
      hasMoreShorts &&
      !shortsFetching &&
      activeIndex >= shorts.length - SHORTS_PREFETCH_THRESHOLD
    ) {
      loadMoreShorts();
    }
  }, [
    theaterOpen,
    activeIndex,
    shorts.length,
    hasMoreShorts,
    shortsFetching,
    loadMoreShorts,
  ]);

  const handleThumbnailClick = (short: IShortResponse) => {
    if (isMobileLayout) {
      navigate(CLIENT_ROUTES.SHORT_WATCH.replace(':shortId', short.id));
      return;
    }

    const globalIndex = shorts.findIndex((s) => s.id === short.id);
    if (globalIndex === -1) return;
    goToIndex(globalIndex);
    setTheaterOpen(true);
  };

  const handleShortNext = () => {
    if (activeIndex < shorts.length - 1 || hasMoreShorts) {
      goNext();
    }
  };

  const { ref: feedSentinelRef } = useInView({
    onChange: (inView) => {
      if (!inView) return;
      if (hasMoreVideos && !videosFetching) loadMoreVideos();
      if (hasMoreShorts && !shortsFetching) loadMoreShorts();
    },
  });

  const contentClassName = `flex-1 min-w-0 flex flex-col gap-8 ${WIDTH_MODE_CLASS[widthMode]}`;

  if (videosInitialLoading && videos.length === 0) {
    return (
      <div className="flex items-start gap-6 w-full">
        <div className={contentClassName}>
          <FeedSkeleton
            columns={columns}
            firstVideoBlockSize={firstVideoBlockSize}
            videosPerBlock={videosPerBlock}
            shortsPerBlock={shortsPerBlock}
          />
        </div>
      </div>
    );
  }

  if (videosErrored && videos.length === 0) {
    return <VideoErrorState onRetry={retryVideos} />;
  }

  if (videos.length === 0) {
    return (
      <VideoEmptyState
        message="No videos yet"
        subMessage="When content is added it'll appear here."
      />
    );
  }

  const blocks = buildFeedBlocks(
    videos,
    shorts,
    firstVideoBlockSize,
    videosPerBlock,
    shortsPerBlock
  );
  const hasMore = hasMoreVideos || hasMoreShorts;

  return (
    <>
      <div className="flex items-start gap-6 w-full">
        <div className={contentClassName}>
          {blocks.map((block, blockIdx) =>
            block.type === 'video' ? (
              <div
                key={`video-block-${blockIdx}`}
                className={`grid gap-4 ${COL_CLASS[columns]}`}
              >
                {block.items.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <div
                key={`shorts-block-${blockIdx}`}
                className={`grid gap-4 ${SHORT_COL_CLASS[shortsPerBlock]}`}
              >
                {block.items.map((short) => (
                  <ShortRailCard
                    key={short.id}
                    short={short}
                    onClick={handleThumbnailClick}
                  />
                ))}
              </div>
            )
          )}

          {(videosFetching || shortsFetching) && (
            <div className={`grid gap-4 ${COL_CLASS[columns]}`}>
              {Array.from({ length: columns }, (_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
          )}

          {hasMore && <div ref={feedSentinelRef} className="h-4" aria-hidden />}
        </div>

        {showChatRail && (
          <div
            className="shrink-0"
            style={{ width: CHAT_RAIL_WIDTH_PX }}
            aria-hidden
          />
        )}
      </div>

      {theaterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setTheaterOpen(false)}
        >
          <div
            className="relative w-full h-full max-h-[90vh]"
            style={{ maxWidth: SHORT_THEATER_WIDTH_PX }}
            onClick={(e) => e.stopPropagation()}
          >
            <ShortPlayer
              short={shorts[activeIndex] ?? null}
              activeIndex={activeIndex}
              total={shorts.length}
              onNext={handleShortNext}
              onPrev={goPrev}
              className="h-full"
            />
          </div>

          <button
            type="button"
            onClick={() => setTheaterOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      )}
    </>
  );
};

export default Feed;
