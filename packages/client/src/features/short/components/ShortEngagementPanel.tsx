import { AnimatePresence, motion } from 'framer-motion';
import { Eye, MessageCircle, Share2 } from 'lucide-react';
import { formatCount, type IShortResponse } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { SPRINGS, DURATIONS } from '../../../shared/motion/springs';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';
import CommentSection from '../../engagement/components/CommentSection';
import AnimatedHeartIcon from '../../engagement/components/AnimatedHeartIcon';
import { useLikeToggle } from '../../engagement/hooks/useLikeToggle';
import { useGetLikeStatusesQuery } from '../../engagement/likeApi';
import { useCreateShareMutation } from '../../engagement/shareApi';

interface ShortEngagementPanelProps {
  short: IShortResponse;
  commentsOpen: boolean;
  onToggleComments: () => void;
}

const ShortEngagementPanel = ({
  short,
  commentsOpen,
  onToggleComments,
}: ShortEngagementPanelProps) => {
  const { reduce } = useMotionSafe();

  const { data: likeStatusData } = useGetLikeStatusesQuery({
    contentType: 'short',
    contentIds: [short.id],
  });
  const { liked, likesCount, toggle: toggleLike } = useLikeToggle({
    contentType: 'short',
    contentId: short.id,
    initialLiked: likeStatusData?.data[short.id] ?? false,
    initialLikesCount: short.likes,
  });

  const [createShare] = useCreateShareMutation();

  const handleShare = async () => {
    try {
      const result = await createShare({
        contentType: 'short',
        contentId: short.id,
      }).unwrap();
      if (typeof navigator.share === 'function') {
        await navigator.share({ url: result.data.url }).catch(() => {});
      } else {
        await navigator.clipboard.writeText(result.data.url);
      }
    } catch {
      // Best-effort - same rationale as the immersive player's share handler.
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-border">
      <AnimatePresence mode="wait" initial={false}>
        {commentsOpen ? (
          <motion.div
            key="expanded"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATIONS.fast }}
            className="flex h-full flex-col"
          >
            <div className="flex shrink-0 items-center justify-around border-b border-border px-2 py-3">
              <div className="flex flex-col items-center gap-0.5 text-text-muted">
                <Eye className="h-5.5 w-5.5" strokeWidth={1.75} />
                <span className="text-[11px] tabular-nums">
                  {formatCount(short.views)}
                </span>
              </div>

              <button
                type="button"
                onClick={toggleLike}
                aria-pressed={liked}
                aria-label={liked ? 'Unlike' : 'Like'}
                className="flex flex-col items-center gap-0.5 focus:outline-none"
              >
                <motion.span
                  whileTap={reduce ? undefined : { scale: 0.85 }}
                  transition={SPRINGS.snappy}
                  className="inline-flex"
                >
                  <AnimatedHeartIcon
                    liked={liked}
                    className={cn(
                      'h-5.5 w-5.5',
                      liked ? 'fill-error text-error' : 'text-text-muted'
                    )}
                  />
                </motion.span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={likesCount}
                    initial={reduce ? false : { y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 6, opacity: 0 }}
                    transition={{ duration: DURATIONS.micro }}
                    className="text-[11px] tabular-nums text-text-muted"
                  >
                    {formatCount(likesCount)}
                  </motion.span>
                </AnimatePresence>
              </button>

              <button
                type="button"
                onClick={onToggleComments}
                aria-pressed={commentsOpen}
                className="flex flex-col items-center gap-0.5 text-primary focus:outline-none"
              >
                <MessageCircle className="h-5.5 w-5.5" strokeWidth={1.75} />
                <span className="text-[11px] tabular-nums">
                  {formatCount(short.commentsCount)}
                </span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                aria-label="Share"
                className="flex flex-col items-center gap-0.5 text-text-muted hover:text-text-primary focus:outline-none"
              >
                <Share2 className="h-5.5 w-5.5" strokeWidth={1.75} />
                <span className="text-[11px]">Share</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
              <CommentSection contentType="short" contentId={short.id} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATIONS.fast }}
            className="flex h-full w-full flex-col items-center gap-5 py-4"
          >
            <div className="flex flex-col items-center gap-1 text-text-muted">
              <Eye className="h-5 w-5" strokeWidth={1.75} />
              <span className="text-[11px] tabular-nums">
                {formatCount(short.views)}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleLike}
              aria-pressed={liked}
              aria-label={liked ? 'Unlike' : 'Like'}
              className="flex flex-col items-center gap-1 focus:outline-none"
            >
              <motion.span
                whileTap={reduce ? undefined : { scale: 0.85 }}
                transition={SPRINGS.snappy}
                className="inline-flex"
              >
                <AnimatedHeartIcon
                  liked={liked}
                  className={cn(
                    'h-5 w-5',
                    liked ? 'fill-error text-error' : 'text-text-muted'
                  )}
                />
              </motion.span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={likesCount}
                  initial={reduce ? false : { y: -6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 6, opacity: 0 }}
                  transition={{ duration: DURATIONS.micro }}
                  className="text-[11px] tabular-nums text-text-muted"
                >
                  {formatCount(likesCount)}
                </motion.span>
              </AnimatePresence>
            </button>

            <button
              type="button"
              onClick={onToggleComments}
              aria-label="Comments"
              className="flex flex-col items-center gap-1 text-text-muted hover:text-text-primary focus:outline-none"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
              <span className="text-[11px] tabular-nums">
                {formatCount(short.commentsCount)}
              </span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              aria-label="Share"
              className="flex flex-col items-center gap-1 text-text-muted hover:text-text-primary focus:outline-none"
            >
              <Share2 className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShortEngagementPanel;
