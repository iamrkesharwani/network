import VideoCardSkeleton from './VideoCardSkeleton';

const FeedSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <VideoCardSkeleton key={i} />
    ))}
  </div>
);

export default FeedSkeleton;
