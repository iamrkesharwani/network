import { useMemo } from 'react';
import {
  RELATED_FEED_PAGE_SIZE,
  SUGGESTIONS_VIDEO_ROWS_PER_SHORT_ROW,
} from '@network/shared';
import InfiniteScroll from '../../../shared/ui/list/InfiniteScroll';
import ShortRailCard from '../../short/components/ShortRailCard';
import { useGridCols } from '../hooks/useGridCols';
import { useRelatedFeedPools } from '../hooks/useRelatedFeedPools';
import { COL_CLASS } from '../utils/videoGrid';
import { buildSuggestionRows } from '../utils/suggestionsGrid';
import VideoCard from '../pages/VideoCard';
import VideoEmptyState from './VideoEmptyState';
import VideoErrorState from './VideoErrorState';
import { VideoGridSkeleton } from '../skeleton/VideoGridSkeleton';

interface SuggestionsGridProps {
  videoId: string;
}

const SuggestionsGrid = ({ videoId }: SuggestionsGridProps) => {
  const cols = useGridCols();
  const {
    pools,
    hasNextPage,
    isLoading,
    isFetchingMore,
    isError,
    fetchNext,
    retry,
  } = useRelatedFeedPools(videoId, RELATED_FEED_PAGE_SIZE);

  const rows = useMemo(
    () =>
      buildSuggestionRows(
        pools.video,
        pools.short,
        cols,
        SUGGESTIONS_VIDEO_ROWS_PER_SHORT_ROW
      ),
    [pools.video, pools.short, cols]
  );

  const hasMore = hasNextPage.video || hasNextPage.short;
  const isEmpty = pools.video.length === 0 && pools.short.length === 0;

  if (isLoading && isEmpty) {
    return <VideoGridSkeleton count={8} cols={cols} />;
  }

  if (isError && isEmpty) {
    return <VideoErrorState onRetry={retry} />;
  }

  if (isEmpty) {
    return (
      <VideoEmptyState
        message="No related videos"
        subMessage="Check back later for more suggestions."
      />
    );
  }

  return (
    <InfiniteScroll
      isLoading={isFetchingMore}
      hasMore={hasMore}
      onLoadMore={fetchNext}
    >
      <div className="flex flex-col gap-6">
        {rows.map((row, index) =>
          row.type === 'video' ? (
            <div
              key={`video-${index}`}
              className={`grid gap-4 ${COL_CLASS[cols]}`}
            >
              {row.items.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div
              key={`short-${index}`}
              className={`grid gap-4 ${COL_CLASS[cols]}`}
            >
              {row.items.map((short) => (
                <ShortRailCard key={short.id} short={short} />
              ))}
            </div>
          )
        )}
      </div>
    </InfiniteScroll>
  );
};

export default SuggestionsGrid;
