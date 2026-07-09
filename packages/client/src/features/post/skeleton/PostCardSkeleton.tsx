import Skeleton from '../../../shared/ui-kit/skeleton/Skeleton';

const PostCardSkeleton = () => (
  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
    <div className="flex items-start gap-3">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-2.5 w-16 rounded" />
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-[90%] rounded" />
      <Skeleton className="h-3 w-[60%] rounded" />
    </div>
  </div>
);

export default PostCardSkeleton;
