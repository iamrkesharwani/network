import Skeleton from '../../../shared/ui/skeleton/Skeleton';

const NotificationItemSkeleton = () => (
  <div className="w-full flex items-start gap-3 px-4 py-3">
    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
    <div className="flex-1 min-w-0 space-y-2">
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  </div>
);

export default NotificationItemSkeleton;
