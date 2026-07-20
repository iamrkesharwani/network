import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart } from 'lucide-react';
import { formatCount, type EngageableContentType } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { SPRINGS, DURATIONS } from '../../../shared/motion/springs';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';
import { useLikeToggle } from '../hooks/useLikeToggle';

export interface LikeButtonProps {
  contentType: EngageableContentType;
  contentId: string;
  initialLiked: boolean;
  initialLikesCount: number;
  size?: 'sm' | 'md';
  className?: string;
}

const PARTICLE_COUNT = 8;

const LikeButton = ({
  contentType,
  contentId,
  initialLiked,
  initialLikesCount,
  size = 'md',
  className,
}: LikeButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { liked, likesCount, toggle, justLiked } = useLikeToggle({
    contentType,
    contentId,
    initialLiked,
    initialLikesCount,
  });
  const { reduce } = useMotionSafe();

  const handleClick = () => {
    if (!liked && !reduce && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      confetti({
        particleCount: PARTICLE_COUNT,
        spread: 60,
        startVelocity: 18,
        gravity: 1.1,
        scalar: 0.6,
        ticks: 60,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
      });
    }
    toggle();
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? 'Unlike' : 'Like'}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors cursor-pointer',
        liked && 'text-error',
        className
      )}
    >
      <motion.span
        whileTap={reduce ? undefined : { scale: 0.85 }}
        transition={SPRINGS.snappy}
        className="relative inline-flex"
      >
        {justLiked && !reduce && (
          <>
            <motion.span
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-error/30"
            />
            <motion.span
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full bg-error/40"
            />
          </>
        )}

        <AnimatePresence mode="popLayout" initial={false}>
          {liked ? (
            <motion.span
              key="filled"
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={SPRINGS.bouncy}
            >
              <Heart className={cn(iconSize, 'fill-current')} strokeWidth={2} />
            </motion.span>
          ) : (
            <motion.span
              key="outline"
              initial={reduce ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={SPRINGS.snappy}
            >
              <Heart className={iconSize} strokeWidth={2} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={likesCount}
          initial={reduce ? false : { y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: DURATIONS.micro }}
          className="tabular-nums"
        >
          {likesCount > 0 ? formatCount(likesCount) : ''}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export default LikeButton;
