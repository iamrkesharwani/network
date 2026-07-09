import Skeleton from '../../../shared/ui-kit/skeleton/Skeleton';
import VideoCardSkeleton from '../../video/skeleton/VideoCardSkeleton';

const ProfileSkeleton = () => (
  <div className="flex flex-col gap-8">
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
      <Skeleton className="w-24 h-24 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col items-center sm:items-start gap-3 w-full">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3.5 w-32" />
        <div className="flex gap-5 mt-1">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default ProfileSkeleton;
