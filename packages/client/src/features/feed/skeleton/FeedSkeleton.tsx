import type { FeedColumnCount } from '../hooks/useFeedColumns';
import { COL_CLASS } from '../../video/utils/videoGrid';
import { SHORT_COL_CLASS, type ShortColCount } from '../../short/utils/shortGrid';
import VideoCardSkeleton from '../../video/skeleton/VideoCardSkeleton';
import ShortCardSkeleton from '../../short/skeleton/ShortCardSkeleton';

interface FeedSkeletonProps {
  columns?: FeedColumnCount;
  firstVideoBlockSize?: number;
  videosPerBlock?: number;
  shortsPerBlock?: ShortColCount;
}

const FeedSkeleton = ({
  columns = 3,
  firstVideoBlockSize = 3,
  videosPerBlock = 6,
  shortsPerBlock = 5,
}: FeedSkeletonProps) => (
  <div className="flex flex-col gap-8">
    <div className={`grid gap-4 ${COL_CLASS[columns]}`}>
      {Array.from({ length: firstVideoBlockSize }, (_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>

    <div className={`grid gap-4 ${SHORT_COL_CLASS[shortsPerBlock]}`}>
      {Array.from({ length: shortsPerBlock }, (_, i) => (
        <ShortCardSkeleton key={i} />
      ))}
    </div>

    <div className={`grid gap-4 ${COL_CLASS[columns]}`}>
      {Array.from({ length: videosPerBlock }, (_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default FeedSkeleton;
