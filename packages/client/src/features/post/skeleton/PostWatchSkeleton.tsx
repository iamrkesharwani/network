import Skeleton from '../../../shared/ui/skeleton/Skeleton';

const PostWatchSkeleton = () => (
  <div className="flex w-full flex-col gap-8">
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_360px] lg:gap-4">
      <div className="flex flex-col gap-3">
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-11 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

export default PostWatchSkeleton;
