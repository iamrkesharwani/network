import { Share2 } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

interface ShareButtonProps {
  compact?: boolean;
  className?: string;
}

const ShareButton = ({ compact = false, className }: ShareButtonProps) => {
  if (compact) {
    return (
      <button
        type="button"
        aria-label="Share"
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-icon transition-colors hover:bg-surface-raised',
          className
        )}
      >
        <Share2 className="h-4 w-4" />
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
      <Share2 className="h-4 w-4 text-icon" />
      Share
    </button>
  );
};

export default ShareButton;
