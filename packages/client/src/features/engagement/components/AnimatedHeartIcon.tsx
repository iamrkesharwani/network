import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { SPRINGS } from '../../../shared/motion/springs';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';

export interface AnimatedHeartIconProps {
  liked: boolean;
  className: string;
}

const AnimatedHeartIcon = ({ liked, className }: AnimatedHeartIconProps) => {
  const { reduce } = useMotionSafe();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={liked ? 'filled' : 'outline'}
        initial={reduce ? false : { scale: liked ? 0 : 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={SPRINGS.snappy}
      >
        <Heart className={className} strokeWidth={1.75} />
      </motion.span>
    </AnimatePresence>
  );
};

export default AnimatedHeartIcon;
