import { AnimatePresence, motion } from 'framer-motion';
import { Award, Flame, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import type { CelebrationItem } from '../hooks/useCreatorCelebration';

interface BadgeToastProps {
  item: CelebrationItem | null;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 4200;

const ICONS: Record<CelebrationItem['kind'], typeof Award> = {
  badge: Award,
  videoMilestone: TrendingUp,
  creatorMilestone: Flame,
};

const KIND_LABEL: Record<CelebrationItem['kind'], string> = {
  badge: 'Badge Unlocked',
  videoMilestone: 'Video Milestone',
  creatorMilestone: 'Creator Milestone',
};

const BadgeToast = ({ item, onDismiss }: BadgeToastProps) => {
  useEffect(() => {
    if (!item) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [item, onDismiss]);

  return (
    <div className="fixed top-20 right-4 z-70 sm:right-6 pointer-events-none">
      <AnimatePresence>
        {item && (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-primary/30 bg-surface-raised pl-3 pr-4 py-3 shadow-2xl shadow-black/40 max-w-xs"
          >
            <div className="relative shrink-0 w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center">
              {(() => {
                const Icon = ICONS[item.kind];
                return <Icon className="w-5 h-5 text-primary" />;
              })()}
            </div>

            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-primary">
                {KIND_LABEL[item.kind]}
              </p>
              <p className="text-sm font-semibold text-text-primary font-display truncate">
                {item.label}
              </p>
              {item.description && (
                <p className="text-[0.7rem] text-text-muted truncate">
                  {item.description}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgeToast;
