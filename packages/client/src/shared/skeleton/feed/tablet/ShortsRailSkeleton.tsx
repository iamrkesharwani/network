import ShortThumbnailSkeleton from '../../short/ShortThumbnailSkeleton';
import { cn } from '../../../utils/cn';

interface ShortsRailSkeletonProps {
  className?: string;
  count?: number;
}

const ShortsRailSkeleton = ({
  className,
  count = 3,
}: ShortsRailSkeletonProps) => (
  <div
    className={cn('flex flex-col gap-3 overflow-hidden', className)}
    aria-hidden="true"
  >
    {Array.from({ length: count }).map((_, i) => (
      <ShortThumbnailSkeleton key={i} className="shrink-0" />
    ))}
  </div>
);

export default ShortsRailSkeleton;
