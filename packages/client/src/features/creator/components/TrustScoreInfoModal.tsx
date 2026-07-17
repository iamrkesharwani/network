import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Upload,
  Eye,
  Sparkles,
  Rocket,
  Target,
  CalendarCheck,
  Scale,
  Flag,
  AlertTriangle,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  TRUST_SIGNAL_CATALOG,
  TRUST_TIERS,
  TRUST_FEATURE_CATALOG,
  BADGE_CATALOG,
  VIDEO_MILESTONE_LIST,
  CREATOR_VIEW_MILESTONE_LIST,
  type TrustSignalType,
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import Modal from '../../../shared/ui/overlay/Modal';
import { useGetMyProfileQuery } from '../creatorApi';

export interface TrustScoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PointEntry {
  key: string;
  label: string;
  points: number;
  icon: LucideIcon;
}

const ACHIEVEMENT_BADGE_ICONS = {
  FIRST_UPLOAD: Rocket,
  TENTH_UPLOAD: Target,
  CONSISTENT_CREATOR: CalendarCheck,
} as const;

const SIGNAL_ICONS: Record<TrustSignalType, LucideIcon> = {
  PUBLISH: Upload,
  JURY_VOTE_MAJORITY: Scale,
  JURY_VOTE_MINORITY: Scale,
  VALID_REPORT_FILED: Flag,
  FALSE_REPORT_FILED: AlertTriangle,
};

const pointEntries: PointEntry[] = [
  ...(
    Object.entries(TRUST_SIGNAL_CATALOG) as Array<
      [TrustSignalType, { label: string; points: number }]
    >
  ).map(([signal, def]) => ({
    key: signal,
    label: def.label,
    points: def.points,
    icon: SIGNAL_ICONS[signal],
  })),
  ...(
    Object.keys(ACHIEVEMENT_BADGE_ICONS) as Array<
      keyof typeof ACHIEVEMENT_BADGE_ICONS
    >
  ).map((id) => ({
    key: id,
    label: BADGE_CATALOG[id].label,
    points: BADGE_CATALOG[id].points,
    icon: ACHIEVEMENT_BADGE_ICONS[id],
  })),
  {
    key: 'VIDEO_MILESTONE',
    label: 'Video Milestone',
    points: VIDEO_MILESTONE_LIST[0]?.points ?? 0,
    icon: Eye,
  },
  {
    key: 'CREATOR_MILESTONE',
    label: 'Total Views Milestone',
    points: CREATOR_VIEW_MILESTONE_LIST[0]?.points ?? 0,
    icon: Sparkles,
  },
];

const gains = pointEntries.filter((entry) => entry.points > 0);
const losses = pointEntries.filter((entry) => entry.points < 0);

const SignalCard = ({
  entry,
  tone,
  index,
}: {
  entry: PointEntry;
  tone: 'gain' | 'loss';
  index: number;
}) => {
  const Icon = entry.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className={cn(
        'flex items-start gap-2.5 rounded-lg border p-2.5',
        tone === 'gain'
          ? 'border-border bg-surface-overlay'
          : 'border-error-subtle bg-error-subtle'
      )}
    >
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          tone === 'gain' ? 'bg-primary-muted' : 'bg-surface-overlay'
        )}
      >
        <Icon
          className={cn(
            'w-3.5 h-3.5',
            tone === 'gain' ? 'text-primary' : 'text-error'
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-text-primary leading-snug">
          {entry.label}
        </p>
        <p
          className={cn(
            'mt-0.5 text-xs font-semibold',
            tone === 'gain' ? 'text-success' : 'text-error'
          )}
        >
          {tone === 'gain' ? '+' : ''}
          {entry.points} pts
        </p>
      </div>
    </motion.div>
  );
};

const TrustScoreInfoModal = ({ isOpen, onClose }: TrustScoreInfoModalProps) => {
  const { data } = useGetMyProfileQuery(undefined, { skip: !isOpen });
  const trust = data?.data.trust;
  const currentTierId = trust ? trust.tier : null;

  const progressPct = trust?.nextTier
    ? Math.max(
        4,
        Math.min(
          100,
          (trust.score / (trust.score + trust.nextTier.pointsToNext)) * 100
        )
      )
    : 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How to increase trust score"
    >
      <div className="space-y-7">
        {trust && (
          <div className="rounded-xl border border-primary/25 bg-primary-subtle p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-muted">
                  <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {TRUST_TIERS.find((t) => t.id === trust.tier)!.label}
                  </p>
                  <p className="text-xs text-text-muted">{trust.score} pts</p>
                </div>
              </div>
              {trust.nextTier && (
                <p className="text-xs text-text-muted text-right max-w-36">
                  {trust.nextTier.pointsToNext} pts to{' '}
                  {TRUST_TIERS.find((t) => t.id === trust.nextTier!.id)!.label}
                </p>
              )}
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-surface-raised overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        <div>
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wide">
            <TrendingUp className="w-3.5 h-3.5 text-success" />
            Ways to earn points
          </p>
          <div className="grid grid-cols-2 gap-2">
            {gains.map((entry, i) => (
              <SignalCard key={entry.key} entry={entry} tone="gain" index={i} />
            ))}
          </div>
        </div>

        {losses.length > 0 && (
          <div>
            <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wide">
              <TrendingDown className="w-3.5 h-3.5 text-error" />
              Avoid these
            </p>
            <div className="grid grid-cols-2 gap-2">
              {losses.map((entry, i) => (
                <SignalCard
                  key={entry.key}
                  entry={entry}
                  tone="loss"
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">
            Tiers &amp; unlocks
          </p>
          <div className="relative pl-5">
            <div className="absolute left-1.75 top-1.5 bottom-1.5 w-px bg-border" />
            {TRUST_TIERS.map((tier) => {
              const achieved = trust ? trust.score >= tier.minScore : false;
              const isCurrent = tier.id === currentTierId;
              return (
                <div key={tier.id} className="relative pb-4 last:pb-0">
                  <div
                    className={cn(
                      'absolute -left-5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2',
                      isCurrent
                        ? 'border-primary bg-primary'
                        : 'border-border bg-surface'
                    )}
                  >
                    {achieved && <Check className="w-2 h-2 text-white" />}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isCurrent ? 'text-primary' : 'text-text-primary'
                      )}
                    >
                      {tier.label}
                      {isCurrent && (
                        <span className="ml-1.5 rounded-full bg-primary-muted px-1.5 py-0.5 text-[10px] font-semibold text-primary align-middle">
                          You
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-text-muted shrink-0">
                      {tier.minScore}+ pts
                    </span>
                  </div>
                  {tier.unlocks.length > 0 && (
                    <p className="mt-0.5 text-xs text-text-muted">
                      {tier.unlocks
                        .map((f) => TRUST_FEATURE_CATALOG[f].label)
                        .join(', ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TrustScoreInfoModal;
