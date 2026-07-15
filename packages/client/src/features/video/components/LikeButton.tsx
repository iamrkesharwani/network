import { Heart } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

interface LikeButtonProps {
  compact?: boolean;
  className?: string;
}

const LikeButton = ({ compact = false, className }: LikeButtonProps) => {
  if (compact) {
    return (
      <button
        type="button"
        aria-label="Like"
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-icon transition-colors hover:bg-surface-raised',
          className
        )}
      >
        <Heart className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-raised',
        className
      )}
    >
      <Heart className="h-4 w-4 text-icon" />
      Like
    </button>
  );
};

export default LikeButton;
