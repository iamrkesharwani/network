import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import {
  UNIFIED_FEED_PAGE_SIZE,
  CHAT_RAIL_WIDTH_PX,
  SHORTS_PREFETCH_THRESHOLD,
  FEED_UNIT_PREFETCH_THRESHOLD,
  SHORT_THEATER_WIDTH_PX,
  type IFeedItem,
  type IShortResponse,
} from '@network/shared';
import usePageTitle from '../../shared/hooks/usePageTitle';
import { useMainWidth } from '../../shared/hooks/useMainWidth';
import { COL_CLASS } from '../video/utils/videoGrid';
import VideoCard from '../video/pages/VideoCard';
import ShortCard from '../short/pages/ShortCard';
import PostCard from '../post/pages/PostCard';
import ShortPlayer from '../short/pages/ShortPlayer';
import { useShort } from '../short/useShort';
import FeedSkeleton from './skeleton/FeedSkeleton';
import PostCardSkeleton from '../post/skeleton/PostCardSkeleton';
import VideoEmptyState from '../video/components/VideoEmptyState';
import VideoErrorState from '../video/components/VideoErrorState';
import { useLiveVideoFeed } from './hooks/useLiveVideoFeed';
import { useLiveShortsFeed } from './hooks/useLiveShortsFeed';
import { useLiveUnifiedFeed } from './hooks/useLiveUnifiedFeed';
import { useFeedColumns, type FeedWidthMode } from './hooks/useFeedColumns';
import { assignToColumns } from './utils/assignToColumns';
import { estimateFeedItemHeight } from './utils/estimateFeedItemHeight';
import { computeColumnWidthPx } from './utils/computeColumnWidth';

const WIDTH_MODE_CLASS: Record<FeedWidthMode, string> = {
  full: '',
  edge: '-mx-4 sm:-mx-6 lg:-mx-8',
};

const Feed = () => {
  usePageTitle('Feed');
  const { columns, widthMode, showChatRail } = useFeedColumns();
  const mainWidthPx = useMainWidth();
  const columnWidthPx = computeColumnWidthPx(mainWidthPx, columns, showChatRail);
  const cardClassName = widthMode === 'edge' ? 'rounded-none' : undefined;
  const [theaterOpen, setTheaterOpen] = useState(false);
  const { activeIndex, goToIndex, goNext, goPrev, updateCurrentShort } =
    useShort();

  const {
    items: leadVideos,
    hasNextPage: hasMoreLeadVideos,
    isFetchingNextPage: leadVideosFetching,
    loadMore: loadMoreLeadVideos,
  } = useLiveVideoFeed();

  const {
    items: shorts,
    hasNextPage: hasMoreShorts,
    isFetchingNextPage: shortsFetching,
    loadMore: loadMoreShorts,
  } = useLiveShortsFeed();

  const {
    items: streamItems,
    isLoading: streamInitialLoading,
    isFetchingNextPage: streamFetching,
    isError: streamErrored,
    hasNextPage: hasMoreStream,
    loadMore: loadMoreStream,
    retry: retryStream,
  } = useLiveUnifiedFeed();

  const chunkCount = Math.max(
    1,
    Math.ceil(streamItems.length / UNIFIED_FEED_PAGE_SIZE)
  );

  useEffect(() => {
    const leadVideosNeeded = chunkCount * columns;
    if (
      leadVideos.length < leadVideosNeeded + FEED_UNIT_PREFETCH_THRESHOLD &&
      hasMoreLeadVideos &&
      !leadVideosFetching
    ) {
      loadMoreLeadVideos();
    }
  }, [
    chunkCount,
    columns,
    leadVideos.length,
    hasMoreLeadVideos,
    leadVideosFetching,
    loadMoreLeadVideos,
  ]);

  useEffect(() => {
    const shortsNeeded = chunkCount * columns;
    if (
      shorts.length < shortsNeeded + FEED_UNIT_PREFETCH_THRESHOLD &&
      hasMoreShorts &&
      !shortsFetching
    ) {
      loadMoreShorts();
    }
  }, [
    chunkCount,
    columns,
    shorts.length,
    hasMoreShorts,
    shortsFetching,
    loadMoreShorts,
  ]);

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

  const { ref: streamSentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasMoreStream && !streamFetching) {
        loadMoreStream();
      }
    },
  });

  const contentClassName = `flex-1 min-w-0 flex flex-col gap-8 ${WIDTH_MODE_CLASS[widthMode]}`;

  if (streamInitialLoading && streamItems.length === 0) {
    return (
      <div className="flex items-start gap-6 w-full">
        <div className={contentClassName}>
          <FeedSkeleton />
        </div>
      </div>
    );
  }

  if (streamErrored && streamItems.length === 0) {
    return <VideoErrorState onRetry={retryStream} />;
  }

  if (streamItems.length === 0) {
    return (
      <VideoEmptyState
        message="No posts or videos yet"
        subMessage="When content is added it'll appear here."
      />
    );
  }

  const chunks: IFeedItem[][] = [];
  for (let i = 0; i < streamItems.length; i += UNIFIED_FEED_PAGE_SIZE) {
    chunks.push(streamItems.slice(i, i + UNIFIED_FEED_PAGE_SIZE));
  }

  return (
    <>
      <div className="flex items-start gap-6 w-full">
        <div className={contentClassName}>
          {chunks.map((chunk, chunkIdx) => {
            const unitLeadVideos = leadVideos.slice(
              chunkIdx * columns,
              (chunkIdx + 1) * columns
            );
            const unitShorts = shorts.slice(
              chunkIdx * columns,
              (chunkIdx + 1) * columns
            );
            const streamColumns = assignToColumns(
              chunk,
              (item) => estimateFeedItemHeight(item, columnWidthPx),
              columns
            );

            return (
              <div key={`unit-${chunkIdx}`} className="flex flex-col gap-8">
                {unitLeadVideos.length > 0 && (
                  <div className={`grid gap-4 ${COL_CLASS[columns]}`}>
                    {unitLeadVideos.map((video) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        className={cardClassName}
                      />
                    ))}
                  </div>
                )}

                {unitShorts.length > 0 && (
                  <div className={`grid gap-4 ${COL_CLASS[columns]}`}>
                    {unitShorts.map((short) => (
                      <ShortCard
                        key={short.id}
                        short={short}
                        onThumbnailClick={handleThumbnailClick}
                        className={cardClassName}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {streamColumns.map((column, columnIdx) => (
                    <div
                      key={`stream-col-${chunkIdx}-${columnIdx}`}
                      className="flex-1 min-w-0 flex flex-col gap-4"
                    >
                      {column.map((entry) =>
                        entry.type === 'video' ? (
                          <VideoCard
                            key={entry.item.id}
                            video={entry.item}
                            className={cardClassName}
                          />
                        ) : (
                          <PostCard
                            key={entry.item.id}
                            post={entry.item}
                            className={cardClassName}
                          />
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {streamFetching && (
            <div className={`grid gap-4 ${COL_CLASS[columns]}`}>
              <PostCardSkeleton />
            </div>
          )}

          {hasMoreStream && (
            <div ref={streamSentinelRef} className="h-4" aria-hidden />
          )}
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
