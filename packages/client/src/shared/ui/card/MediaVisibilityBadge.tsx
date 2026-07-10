import { EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MediaVisibilityBadgeProps {
  visibility: 'public' | 'private' | 'unlisted';
  className?: string;
}

const MediaVisibilityBadge = ({
  visibility,
  className,
}: MediaVisibilityBadgeProps) => {
  if (visibility === 'public') return null;

  return (
    <span
      className={cn(
        'absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/70 text-text-secondary backdrop-blur-sm leading-tight',
        className
      )}
    >
      <EyeOff className="w-3 h-3" strokeWidth={2} />
      {visibility === 'private' ? 'Private' : 'Unlisted'}
    </span>
  );
};

export default MediaVisibilityBadge;
