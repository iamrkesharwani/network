import {
  Heart,
  MessageCircle,
  Share2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import Skeleton from '../../../shared/ui-kit/skeleton/Skeleton';
import { cn } from '../../../shared/utils/cn';

interface ShortPlayerSkeletonProps {
  className?: string;
}

const ShortPlayerSkeleton = ({ className }: ShortPlayerSkeletonProps) => (
  <div
    className={cn(
      'relative w-full h-full rounded-2xl overflow-hidden bg-surface-raised',
      className
    )}
    aria-hidden="true"
  >
    <div className="absolute inset-0 bg-linear-to-br from-surface-overlay/40 to-surface-raised/40" />

    <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-surface-overlay ring-2 ring-border shrink-0" />
      <Skeleton className="h-3.5 w-24 rounded" />
    </div>

    <div className="absolute right-3 bottom-4 flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-surface-overlay backdrop-blur-sm flex items-center justify-center ring-1 ring-border">
          <Heart className="w-5 h-5 text-text-muted/50" strokeWidth={1.75} />
        </div>
        <Skeleton className="h-2.5 w-6 rounded" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-surface-overlay backdrop-blur-sm flex items-center justify-center ring-1 ring-border">
          <MessageCircle
            className="w-5 h-5 text-text-muted/50"
            strokeWidth={1.75}
          />
        </div>
        <Skeleton className="h-2.5 w-6 rounded" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-surface-overlay backdrop-blur-sm flex items-center justify-center ring-1 ring-border">
          <Share2 className="w-5 h-5 text-text-muted/50" strokeWidth={1.75} />
        </div>
        <Skeleton className="h-2.5 w-8 rounded" />
      </div>

      <div className="flex flex-col gap-2 mt-1">
        <div className="w-11 h-11 rounded-full bg-surface-overlay backdrop-blur-sm flex items-center justify-center ring-1 ring-border">
          <ChevronUp className="w-5 h-5 text-text-muted/50" strokeWidth={2.5} />
        </div>
        <div className="w-11 h-11 rounded-full bg-surface-overlay backdrop-blur-sm flex items-center justify-center ring-1 ring-border">
          <ChevronDown
            className="w-5 h-5 text-text-muted/50"
            strokeWidth={2.5}
          />
        </div>
      </div>
    </div>

    <div className="absolute bottom-4 left-4 right-16 flex flex-col gap-2">
      <Skeleton className="h-3.5 w-[90%] rounded" />
      <Skeleton className="h-3.5 w-[55%] rounded" />
    </div>
  </div>
);

export default ShortPlayerSkeleton;
