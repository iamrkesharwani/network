import {
  Heart,
  MessageCircle,
  Share2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import Skeleton from '../Skeleton';
import { cn } from '../../utils/cn';

interface ShortPlayerSkeletonProps {
  className?: string;
}

const ShortPlayerSkeleton = ({ className }: ShortPlayerSkeletonProps) => (
  <div
    className={cn(
      'relative w-full h-full rounded-2xl overflow-hidden bg-black',
      className
    )}
    aria-hidden="true"
  >
    <div className="absolute inset-0 bg-linear-to-br from-surface-overlay/40 to-surface-raised/40" />

    <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-white/15 ring-2 ring-white/10 shrink-0" />
      <Skeleton className="h-3.5 w-24 rounded bg-white/15" />
    </div>

    <div className="absolute right-3 bottom-4 flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10">
          <Heart className="w-5 h-5 text-white/30" strokeWidth={1.75} />
        </div>
        <Skeleton className="h-2.5 w-6 rounded bg-white/15" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10">
          <MessageCircle className="w-5 h-5 text-white/30" strokeWidth={1.75} />
        </div>
        <Skeleton className="h-2.5 w-6 rounded bg-white/15" />
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10">
          <Share2 className="w-5 h-5 text-white/30" strokeWidth={1.75} />
        </div>
        <Skeleton className="h-2.5 w-8 rounded bg-white/15" />
      </div>

      <div className="flex flex-col gap-2 mt-1">
        <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10">
          <ChevronUp className="w-5 h-5 text-white/30" strokeWidth={2.5} />
        </div>
        <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10">
          <ChevronDown className="w-5 h-5 text-white/30" strokeWidth={2.5} />
        </div>
      </div>
    </div>

    <div className="absolute bottom-4 left-4 right-16 flex flex-col gap-2">
      <Skeleton className="h-3.5 w-[90%] rounded bg-white/15" />
      <Skeleton className="h-3.5 w-[55%] rounded bg-white/15" />
    </div>
  </div>
);

export default ShortPlayerSkeleton;
