import Skeleton from '../../../shared/ui/skeleton/Skeleton';

const VideoCardSkeleton = () => (
  <div className="flex flex-col gap-2.5">
    <Skeleton className="w-full aspect-video rounded-xl" />
    <div className="flex gap-2.5 px-0.5">
      <Skeleton className="w-8 h-8 rounded-full shrink-0 mt-0.5" />
      <div className="flex-1 flex flex-col gap-2 pt-0.5">
        <Skeleton className="h-3 w-[30%] rounded" />
        <Skeleton className="h-3.5 w-[85%] rounded" />
        <Skeleton className="h-3.5 w-[60%] rounded" />
        <Skeleton className="h-3 w-[40%] rounded mt-0.5" />
      </div>
    </div>
  </div>
);

export default VideoCardSkeleton;
