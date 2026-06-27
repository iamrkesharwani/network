import Skeleton from '../Skeleton';

const VideoCardSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="w-full aspect-video rounded-xl" />
    <div className="flex gap-3">
      <Skeleton className="w-9 h-9 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-2 pt-0.5">
        <Skeleton className="h-3.5 w-[90%]" />
        <Skeleton className="h-3 w-[60%]" />
      </div>
    </div>
  </div>
);

export default VideoCardSkeleton;
