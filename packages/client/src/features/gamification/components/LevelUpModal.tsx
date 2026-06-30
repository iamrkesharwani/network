import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fireLevelUpBurst } from '../confetti';
import { Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  level: number | null;
  onDismiss: () => void;
}

const LevelUpModal = ({ level, onDismiss }: LevelUpModalProps) => {
  useEffect(() => {
    if (level === null) return;
    fireLevelUpBurst();
  }, [level]);

  return (
    <AnimatePresence>
      {level !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-surface-raised px-10 py-10 text-center shadow-2xl shadow-primary/10"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 1.5 }}
              className="flex items-center justify-center w-20 h-20 rounded-full bg-primary text-white"
            >
              <Sparkles className="w-10 h-10" />
            </motion.div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                Level Up
              </p>
              <p className="text-4xl font-bold font-display text-text-primary">
                Level {level}
              </p>
            </div>

            <p className="text-sm text-text-muted max-w-xs">
              You're levelling up as a creator. Keep publishing to unlock more
              achievements and climb the ranks.
            </p>

            <button
              type="button"
              onClick={onDismiss}
              className="mt-2 px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Nice!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpModal;
