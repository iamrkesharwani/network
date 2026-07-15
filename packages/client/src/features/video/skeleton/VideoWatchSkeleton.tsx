import Skeleton from '../../../shared/ui/skeleton/Skeleton';

const VideoWatchSkeleton = () => (
  <div className="flex w-full flex-col">
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_360px] lg:gap-4">
      <Skeleton className="-mx-4 aspect-video md:-mx-5 md:-mt-5 lg:mr-0" />

      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>

    <div className="flex flex-col gap-4 py-4">
      <Skeleton className="h-8 w-40 rounded-lg" />
    </div>
  </div>
);

export default VideoWatchSkeleton;
