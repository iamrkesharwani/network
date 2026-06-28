import ShortPlayerSkeleton from '../../short/ShortPlayerSkeleton';
import { VideoGridSkeleton } from '../../video/VideoGridSkeleton';

const FeedSkeletonTabletPortrait = () => (
  <div className="flex items-start w-full" aria-hidden="true">
    <div
      className="sticky shrink-0 self-start"
      style={{
        top: 0,
        height: 'calc(100vh - 3.5rem)',
        width: 'calc(22rem + 2rem)',
      }}
    >
      <div className="h-full pl-4 sm:pl-6 lg:pl-8 py-4 sm:py-6 lg:py-8 pr-3">
        <ShortPlayerSkeleton className="h-full" />
      </div>
    </div>

    <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pl-0">
      <VideoGridSkeleton count={4} cols={1} />
    </div>
  </div>
);

export default FeedSkeletonTabletPortrait;
