import { cn } from '../../utils/cn';

interface ShortThumbnailSkeletonProps {
  className?: string;
}

const ShortThumbnailSkeleton = ({ className }: ShortThumbnailSkeletonProps) => (
  <div
    className={cn(
      'relative w-full aspect-9/16 rounded-xl overflow-hidden bg-surface-raised skeleton-shimmer',
      className
    )}
    aria-hidden="true"
  >
    <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1.5">
      <div className="h-2 w-[80%] rounded bg-white/20" />
      <div className="h-2 w-[50%] rounded bg-white/20" />
    </div>
  </div>
);

export default ShortThumbnailSkeleton;
