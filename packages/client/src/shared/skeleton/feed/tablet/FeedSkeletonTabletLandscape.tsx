import ShortsRailSkeleton from './ShortsRailSkeleton';
import { VideoGridSkeleton } from '../../video/VideoGridSkeleton';

const FeedSkeletonTabletLandscape = () => (
  <div className="flex items-start w-full" aria-hidden="true">
    <div
      className="sticky shrink-0 self-start w-56"
      style={{ top: 0, height: 'calc(100vh - 3.5rem)' }}
    >
      <div className="h-full pl-4 sm:pl-6 py-4 sm:py-6 pr-3">
        <ShortsRailSkeleton className="h-full" count={4} />
      </div>
    </div>

    <div className="flex-1 min-w-0 px-4 sm:px-6 py-4 sm:py-6 pl-0">
      <VideoGridSkeleton count={6} cols={2} />
    </div>
  </div>
);

export default FeedSkeletonTabletLandscape;
