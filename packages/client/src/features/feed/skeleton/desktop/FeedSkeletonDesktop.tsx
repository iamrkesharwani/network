import ShortPlayerSkeleton from '../../../short/skeleton/ShortPlayerSkeleton';
import { VideoGridSkeleton } from '../../../video/skeleton/VideoGridSkeleton';

const FeedSkeletonDesktop = () => (
  <div className="flex items-start w-full" aria-hidden="true">
    <div
      className="sticky shrink-0 self-start -mt-4 sm:-mt-6 lg:-mt-8 h-[calc(100vh-3.5rem-2rem)] sm:h-[calc(100vh-3.5rem-3rem)] lg:h-[calc(100vh-3.5rem-4rem)]"
      style={{
        top: 0,
        width: 'calc(22rem + 2rem)',
      }}
    >
      <div className="h-full pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 lg:pb-0 pl-4 sm:pl-6 lg:pl-8 pr-3">
        <ShortPlayerSkeleton className="h-full" />
      </div>
    </div>

    <div className="flex-1 min-w-0 -mt-4 sm:-mt-6 lg:-mt-8 pt-4 sm:pt-6 lg:pt-8 px-4 sm:px-6 lg:px-8 pl-0">
      <VideoGridSkeleton count={9} cols={3} />
    </div>
  </div>
);

export default FeedSkeletonDesktop;
