import VideoCardSkeleton from '../../video/skeleton/VideoCardSkeleton';
import ShortCardSkeleton from '../../short/skeleton/ShortCardSkeleton';
import PostCardSkeleton from '../../post/skeleton/PostCardSkeleton';

const SKELETON_CARDS = [
  VideoCardSkeleton,
  ShortCardSkeleton,
  PostCardSkeleton,
] as const;

const FeedSkeleton = () => (
  <div className="flex-1 min-w-0 flex flex-col gap-5">
    {Array.from({ length: 5 }).map((_, i) => {
      const Card = SKELETON_CARDS[i % SKELETON_CARDS.length];
      return <Card key={i} />;
    })}
  </div>
);

export default FeedSkeleton;
