import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import type { BookmarkableContentType } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { SPRINGS } from '../../../shared/motion/springs';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';
import { useBookmarkToggle } from '../hooks/useBookmarkToggle';

export interface BookmarkButtonProps {
  contentType: BookmarkableContentType;
  contentId: string;
  initialBookmarked: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const BookmarkButton = ({
  contentType,
  contentId,
  initialBookmarked,
  size = 'md',
  className,
}: BookmarkButtonProps) => {
  const { bookmarked, toggle } = useBookmarkToggle({
    contentType,
    contentId,
    initialBookmarked,
  });
  const { reduce } = useMotionSafe();

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? 'Remove from saved' : 'Save'}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors',
        bookmarked && 'text-primary',
        className
      )}
    >
      <motion.span
        whileTap={reduce ? undefined : { scale: 0.85 }}
        transition={SPRINGS.snappy}
        className="relative inline-flex"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {bookmarked ? (
            <motion.span
              key="filled"
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={SPRINGS.snappy}
            >
              <Bookmark className={cn(iconSize, 'fill-current')} strokeWidth={2} />
            </motion.span>
          ) : (
            <motion.span
              key="outline"
              initial={reduce ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={SPRINGS.snappy}
            >
              <Bookmark className={iconSize} strokeWidth={2} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  );
};

export default BookmarkButton;
