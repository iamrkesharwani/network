import Skeleton from './Skeleton';

const DefaultPageSkeleton = () => (
  <div className="flex flex-col gap-4">
    <Skeleton className="h-5 w-40" />
    <Skeleton className="h-32 w-full rounded-xl" />
    <Skeleton className="h-32 w-full rounded-xl" />
  </div>
);

export default DefaultPageSkeleton;
