import { useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight, HelpCircle } from 'lucide-react';
import { TRUST_TIERS } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { buildProfileTabPath } from '../../profile/utils/buildProfilePath';
import { useGetMyProfileQuery } from '../creatorApi';
import TrustScoreInfoModal from './TrustScoreInfoModal';

export interface TrustBadgeProps {
  username: string;
  variant?: 'compact' | 'full';
  className?: string;
}

const TrustBadge = ({
  username,
  variant = 'compact',
  className,
}: TrustBadgeProps) => {
  const { data, isLoading } = useGetMyProfileQuery();
  const [infoOpen, setInfoOpen] = useState(false);

  if (isLoading || !data) return null;

  const { score, tier } = data.data.trust;
  const tierLabel = TRUST_TIERS.find((t) => t.id === tier)!.label;
  const statsPath = buildProfileTabPath(username, 'stats');

  const openInfo = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInfoOpen(true);
  };

  if (variant === 'full') {
    return (
      <>
        <Link
          to={statsPath}
          title={`Trust score: ${score}`}
          className={cn(
            'flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-overlay px-4 py-3',
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-semibold text-text-primary truncate">
              {tierLabel}
            </span>
            <span className="text-sm text-text-muted">·</span>
            <span className="text-sm font-medium text-text-secondary">
              {score} pts
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={openInfo}
              title="How to increase trust score?"
              className="rounded-full p-1 text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </div>
        </Link>
        <TrustScoreInfoModal
          isOpen={infoOpen}
          onClose={() => setInfoOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <Link
        to={statsPath}
        title={`Trust score: ${score}`}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-overlay px-3 py-1.5 shrink-0 hover:border-primary/30 transition-colors',
          className
        )}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs font-semibold text-text-primary">
          {tierLabel}
        </span>
        <span className="text-xs text-text-muted">·</span>
        <span className="text-xs font-medium text-text-secondary">{score}</span>
        <button
          type="button"
          onClick={openInfo}
          title="How to increase trust score?"
          className="ml-0.5 text-text-muted hover:text-text-primary transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </Link>
      <TrustScoreInfoModal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </>
  );
};

export default TrustBadge;
