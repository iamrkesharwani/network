import PostCardSkeleton from './PostCardSkeleton';

interface PostGridSkeletonProps {
  count: number;
}

export const PostGridSkeleton = ({ count }: PostGridSkeletonProps) => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
);

export const PostRowSkeleton = () => <PostCardSkeleton />;
