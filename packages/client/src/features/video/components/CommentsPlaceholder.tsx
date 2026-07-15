import { MessageCircle } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

interface CommentsPlaceholderProps {
  compact?: boolean;
  className?: string;
}

const CommentsPlaceholder = ({
  compact = false,
  className,
}: CommentsPlaceholderProps) => {
  if (compact) {
    return (
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-icon',
          className
        )}
      >
        <MessageCircle className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-border p-3',
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
        <MessageCircle className="h-4 w-4 text-icon" />
        Comments
      </div>
      <p className="text-xs text-text-muted">Comments are coming soon.</p>
    </div>
  );
};

export default CommentsPlaceholder;
