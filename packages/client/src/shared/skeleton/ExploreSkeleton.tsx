import Skeleton from './Skeleton';
import VideoCardSkeleton from './video/VideoCardSkeleton';

const ExploreSkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="flex gap-2.5 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default ExploreSkeleton;
