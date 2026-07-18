import {
  ArrowUp,
  ArrowDown,
  Upload,
  Eye,
  Sparkles,
  Rocket,
  Target,
  CalendarCheck,
  Scale,
  Flag,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  TRUST_SIGNAL_CATALOG,
  BADGE_CATALOG,
  VIDEO_MILESTONE_LIST,
  CREATOR_VIEW_MILESTONE_LIST,
  type TrustSignalType,
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import Modal from '../../../shared/ui/overlay/Modal';

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

const SectionHeader = ({
  icon: Icon,
  tone,
  label,
}: {
  icon: LucideIcon;
  tone: 'gain' | 'loss';
  label: string;
}) => (
  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
    <span
      className={cn(
        'flex h-5 w-5 items-center justify-center rounded-full',
        tone === 'gain' ? 'bg-success/15 text-success' : 'bg-error/15 text-error'
      )}
    >
      <Icon className="w-3 h-3" strokeWidth={2.5} />
    </span>
    {label}
  </p>
);

const SignalRow = ({
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
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-surface-raised"
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          tone === 'gain' ? 'bg-primary-muted' : 'bg-error-subtle'
        )}
      >
        <Icon
          className={cn('w-4 h-4', tone === 'gain' ? 'text-primary' : 'text-error')}
        />
      </div>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
        {entry.label}
      </p>
      <span
        className={cn(
          'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
          tone === 'gain' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
        )}
      >
        {tone === 'gain' ? '+' : ''}
        {entry.points}
      </span>
    </motion.div>
  );
};

const TrustScoreInfoModal = ({ isOpen, onClose }: TrustScoreInfoModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How to increase trust score"
    >
      <div className="space-y-6">
        <p className="text-xs leading-relaxed text-text-muted">
          Points rise when you publish quality content and vote fairly, and
          drop when you break platform rules.
        </p>

        <div>
          <SectionHeader icon={ArrowUp} tone="gain" label="Ways to earn points" />
          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface-overlay divide-y divide-border">
            {gains.map((entry, i) => (
              <SignalRow key={entry.key} entry={entry} tone="gain" index={i} />
            ))}
          </div>
        </div>

        {losses.length > 0 && (
          <div>
            <SectionHeader icon={ArrowDown} tone="loss" label="Avoid these" />
            <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface-overlay divide-y divide-border">
              {losses.map((entry, i) => (
                <SignalRow key={entry.key} entry={entry} tone="loss" index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TrustScoreInfoModal;
