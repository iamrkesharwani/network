import type { IUnlockedAchievement } from '@network/shared';
import { useEffect } from 'react';
import { fireMilestoneBurst } from '../confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { getAchievementIcon } from '../achievementIcons';

interface AchievementPopupProps {
  achievement: IUnlockedAchievement | null;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 4200;

const AchievementPopup = ({
  achievement,
  onDismiss,
}: AchievementPopupProps) => {
  useEffect(() => {
    if (!achievement) return;
    fireMilestoneBurst();
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  return (
    <div className="fixed top-20 right-4 z-70 sm:right-6 pointer-events-none">
      <AnimatePresence>
        {achievement && (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-primary/30 bg-surface-raised pl-3 pr-4 py-3 shadow-2xl shadow-black/40 max-w-xs"
          >
            <div className="relative shrink-0 w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 14,
                  delay: 0.1,
                }}
              >
                {(() => {
                  const Icon = getAchievementIcon(achievement.icon);
                  return <Icon className="w-5 h-5 text-primary" />;
                })()}
              </motion.div>
            </div>

            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-primary">
                Achievement Unlocked
              </p>
              <p className="text-sm font-semibold text-text-primary font-display truncate">
                {achievement.label}
              </p>
              <p className="text-[0.7rem] text-text-muted">
                +{achievement.xpReward} XP
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementPopup;
