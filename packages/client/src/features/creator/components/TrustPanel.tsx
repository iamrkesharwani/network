import { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import {
  TRUST_TIERS,
  TRUST_FEATURE_CATALOG,
  TRUST_FEATURE_IDS,
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { useGetMyProfileQuery } from '../creatorApi';
import TrustScoreInfoModal from './TrustScoreInfoModal';

const TrustPanel = () => {
  const { data, isLoading } = useGetMyProfileQuery();
  const [infoOpen, setInfoOpen] = useState(false);

  if (isLoading || !data) return null;

  const { score, tier, nextTier, unlockedFeatures } = data.data.trust;
  const tierLabel = TRUST_TIERS.find((t) => t.id === tier)!.label;
  const unlockedSet = new Set(unlockedFeatures);

  const progressPct = nextTier
    ? Math.max(
        4,
        Math.min(100, (score / (score + nextTier.pointsToNext)) * 100)
      )
    : 100;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-text-primary">
            {tierLabel}
          </span>
        </div>
        <span className="text-sm font-medium text-text-secondary">
          {score} pts
        </span>
      </div>

      <div className="mt-3 h-1.5 w-full rounded-full bg-surface-raised overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-text-muted">
        {nextTier
          ? `${nextTier.pointsToNext} pts to ${TRUST_TIERS.find((t) => t.id === nextTier.id)!.label}`
          : "You've reached the highest trust tier"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {TRUST_FEATURE_IDS.map((featureId) => {
          const unlocked = unlockedSet.has(featureId);
          return (
            <div
              key={featureId}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                unlocked
                  ? 'border-primary/30 bg-primary-muted text-text-primary'
                  : 'border-border text-text-muted opacity-60'
              )}
            >
              {unlocked ? (
                <CheckCircle2 className="w-3 h-3 text-primary" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
              {TRUST_FEATURE_CATALOG[featureId].label}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setInfoOpen(true)}
        className="mt-4 text-xs font-medium text-primary hover:underline"
      >
        How to increase trust score?
      </button>

      <TrustScoreInfoModal
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </div>
  );
};

export default TrustPanel;
