import Skeleton from '../../../shared/ui/skeleton/Skeleton';

const PlaylistCardSkeleton = () => (
  <div className="flex flex-col gap-2">
    <Skeleton className="w-full aspect-video rounded-xl" />
    <div className="flex flex-col gap-2 px-0.5 pt-0.5">
      <Skeleton className="h-3.5 w-[75%] rounded" />
      <Skeleton className="h-3 w-[40%] rounded" />
    </div>
  </div>
);

export default PlaylistCardSkeleton;
