import { Play } from 'lucide-react';
import { formatDuration } from '@network/shared';
import { cn } from '../../utils/cn';

interface MediaDurationBadgeProps {
  durationSeconds: number;
  isShort?: boolean;
  className?: string;
}

const MediaDurationBadge = ({
  durationSeconds,
  isShort = false,
  className,
}: MediaDurationBadgeProps) => {
  if (durationSeconds <= 0) return null;

  return (
    <span
      className={cn(
        'absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium font-mono tabular-nums bg-black/70 text-white backdrop-blur-sm leading-tight',
        className
      )}
    >
      {isShort && (
        <Play className="w-2.5 h-2.5 fill-white" strokeWidth={0} />
      )}
      {formatDuration(durationSeconds)}
    </span>
  );
};

export default MediaDurationBadge;
