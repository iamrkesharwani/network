import { Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

interface UnlistedCountdownBadgeProps {
  daysLeft: number;
  className?: string;
}

const UnlistedCountdownBadge = ({
  daysLeft,
  className,
}: UnlistedCountdownBadgeProps) => (
  <span
    className={cn(
      'absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/70 text-text-secondary backdrop-blur-sm leading-tight',
      className
    )}
  >
    <Clock className="w-3 h-3" strokeWidth={2} />
    {daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}
  </span>
);

export default UnlistedCountdownBadge;
