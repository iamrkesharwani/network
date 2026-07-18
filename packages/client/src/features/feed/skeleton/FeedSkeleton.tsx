import { POST_TILE_HEIGHT_PX, type FeedColumnCount } from '@network/shared';
import { COL_CLASS } from '../../video/utils/videoGrid';
import VideoCardSkeleton from '../../video/skeleton/VideoCardSkeleton';
import ShortCardSkeleton from '../../short/skeleton/ShortCardSkeleton';
import Skeleton from '../../../shared/ui/skeleton/Skeleton';
import {
  SHORT_COL_CLASS,
  type ShortColCount,
} from '../../short/utils/shortGrid';

interface FeedSkeletonProps {
  columns?: FeedColumnCount;
  firstVideoBlockSize?: number;
  videosPerBlock?: number;
  shortsPerBlock?: ShortColCount;
  postsPerBlock?: number;
}

const FeedSkeleton = ({
  columns = 3,
  firstVideoBlockSize = 3,
  videosPerBlock = 6,
  shortsPerBlock = 5,
  postsPerBlock = 2,
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

    <div
      className={`grid gap-4 ${COL_CLASS[postsPerBlock as FeedColumnCount]}`}
    >
      {Array.from({ length: postsPerBlock }, (_, i) => (
        <Skeleton
          key={i}
          className="rounded-2xl"
          style={{ height: POST_TILE_HEIGHT_PX }}
        />
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
