import { COL_CLASS, type ColCount } from '../../utils/videoGrid';
import VideoCardSkeleton from './VideoCardSkeleton';

interface VideoGridSkeletonProps {
  count: number;
  cols: ColCount;
}

export const VideoGridSkeleton = ({ count, cols }: VideoGridSkeletonProps) => (
  <div className={`grid ${COL_CLASS[cols]} gap-x-4 gap-y-7`}>
    {Array.from({ length: count }).map((_, i) => (
      <VideoCardSkeleton key={i} />
    ))}
  </div>
);

interface VideoRowSkeletonProps {
  cols: ColCount;
}

export const VideoRowSkeleton = ({ cols }: VideoRowSkeletonProps) => (
  <div className={`grid ${COL_CLASS[cols]} gap-x-4`}>
    {Array.from({ length: cols }).map((_, i) => (
      <VideoCardSkeleton key={i} />
    ))}
  </div>
);
