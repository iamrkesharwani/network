import ShortThumbnailSkeleton from '../../../short/skeleton/ShortThumbnailSkeleton';
import { VideoGridSkeleton } from '../../../video/skeleton/VideoGridSkeleton';

const SHORTS_BLOCKS = 2;
const VIDEOS_PER_BLOCK = 4;
const TRAILING_SHORTS = 4;

const FeedSkeletonMobileLandscape = () => (
  <div className="flex flex-col gap-5 w-full" aria-hidden="true">
    {Array.from({ length: SHORTS_BLOCKS }).map((_, blockIdx) => (
      <div key={blockIdx} className="flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShortThumbnailSkeleton key={i} />
          ))}
        </div>
        <VideoGridSkeleton count={VIDEOS_PER_BLOCK} cols={2} />
      </div>
    ))}

    <div>
      <div className="h-3 w-24 rounded bg-surface-raised skeleton-shimmer mb-3" />
      <div className="flex gap-3 overflow-x-hidden pb-2">
        {Array.from({ length: TRAILING_SHORTS }).map((_, i) => (
          <ShortThumbnailSkeleton key={i} className="shrink-0 w-28" />
        ))}
      </div>
    </div>
  </div>
);

export default FeedSkeletonMobileLandscape;
