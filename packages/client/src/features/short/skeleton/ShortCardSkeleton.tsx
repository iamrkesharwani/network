import Skeleton from '../../../shared/ui/skeleton/Skeleton';

const ShortCardSkeleton = () => (
  <div className="flex flex-col gap-2">
    <Skeleton className="w-full aspect-9/16 rounded-xl" />
    <div className="flex flex-col gap-2 px-0.5 pt-0.5">
      <Skeleton className="h-3.5 w-[85%] rounded" />
      <Skeleton className="h-3.5 w-[60%] rounded" />
      <Skeleton className="h-3 w-[40%] rounded mt-0.5" />
    </div>
  </div>
);

export default ShortCardSkeleton;
