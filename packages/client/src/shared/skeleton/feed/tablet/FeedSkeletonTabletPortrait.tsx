import ShortsRailSkeleton from './ShortsRailSkeleton';
import { VideoGridSkeleton } from '../../video/VideoGridSkeleton';

const FeedSkeletonTabletPortrait = () => (
  <div className="flex items-start w-full" aria-hidden="true">
    <div
      className="sticky shrink-0 self-start w-44"
      style={{ top: 0, height: '70vh' }}
    >
      <div className="h-full pl-4 sm:pl-6 py-4 sm:py-6 pr-3">
        <ShortsRailSkeleton className="h-full" count={3} />
      </div>
    </div>

    <div className="flex-1 min-w-0 px-4 sm:px-6 py-4 sm:py-6 pl-0 flex flex-col gap-5">
      <VideoGridSkeleton count={2} cols={1} />
      <VideoGridSkeleton count={4} cols={2} />
    </div>
  </div>
);

export default FeedSkeletonTabletPortrait;
