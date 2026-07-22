import Skeleton from '../../../shared/ui/skeleton/Skeleton';

const ConversationListItemSkeleton = () => (
  <div className="flex items-center gap-3 px-2 py-2.5">
    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-3.5 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  </div>
);

export default ConversationListItemSkeleton;
