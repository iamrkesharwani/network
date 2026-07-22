import { formatLastActive } from '@network/shared';
import { cn } from '../../../shared/utils/cn';

interface PresenceDotProps {
  isOnline: boolean;
  lastActiveAt?: string;
  showLabel?: boolean;
  className?: string;
}

const PresenceDot = ({
  isOnline,
  lastActiveAt,
  showLabel,
  className,
}: PresenceDotProps) => {
  if (!showLabel) {
    return (
      <span
        className={cn(
          'inline-block h-2.5 w-2.5 rounded-full ring-2 ring-surface',
          isOnline ? 'bg-success' : 'bg-text-muted',
          className
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <span className={cn('text-xs text-text-muted', className)}>
      {isOnline
        ? 'Active now'
        : lastActiveAt
          ? formatLastActive(lastActiveAt)
          : 'Offline'}
    </span>
  );
};

export default PresenceDot;
