import { ShieldCheck } from 'lucide-react';
import { TRUST_TIER_LABELS } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { useGetMyProfileQuery } from '../creatorApi';

export interface TrustBadgeProps {
  className?: string;
}

const TrustBadge = ({ className }: TrustBadgeProps) => {
  const { data, isLoading } = useGetMyProfileQuery();

  if (isLoading || !data) return null;

  const { score, tier } = data.data.trust;
  const tierLabel = TRUST_TIER_LABELS[tier];

  return (
    <div
      title={`Trust score: ${score}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-overlay px-3 py-1.5 shrink-0',
        className
      )}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs font-semibold text-text-primary">
        {tierLabel}
      </span>
      <span className="text-xs text-text-muted">·</span>
      <span className="text-xs font-medium text-text-secondary">{score}</span>
    </div>
  );
};

export default TrustBadge;
