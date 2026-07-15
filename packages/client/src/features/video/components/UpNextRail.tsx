import { useMemo } from 'react';
import { RELATED_FEED_PAGE_SIZE, UP_NEXT_RAIL_SIZE } from '@network/shared';
import { useRelatedFeedPools } from '../hooks/useRelatedFeedPools';
import VideoRailCard from './VideoRailCard';

interface UpNextRailProps {
  videoId: string;
  onShowMore: () => void;
}

const UpNextRail = ({ videoId, onShowMore }: UpNextRailProps) => {
  const { pools, hasNextPage } = useRelatedFeedPools(
    videoId,
    RELATED_FEED_PAGE_SIZE
  );

  const railVideos = useMemo(
    () => pools.video.slice(0, UP_NEXT_RAIL_SIZE),
    [pools.video]
  );
  const hasMore = pools.video.length > UP_NEXT_RAIL_SIZE || hasNextPage.video;

  if (railVideos.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto px-2 pb-1">
      {railVideos.map((video) => (
        <VideoRailCard key={video.id} video={video} />
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={onShowMore}
          className="flex aspect-video w-56 shrink-0 items-center justify-center rounded-lg bg-surface-overlay text-sm font-medium text-text-primary hover:bg-surface-raised"
        >
          Show more videos
        </button>
      )}
    </div>
  );
};

export default UpNextRail;
