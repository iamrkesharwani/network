import Skeleton from '../../../shared/ui/skeleton/Skeleton';

const MessageThreadSkeleton = () => (
  <div className="flex flex-1 flex-col gap-3 p-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-9 rounded-2xl ${i % 2 === 0 ? 'w-2/3 self-start' : 'w-1/2 self-end'}`}
      />
    ))}
  </div>
);

export default MessageThreadSkeleton;
