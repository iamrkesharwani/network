import { ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ContentType, ICommentResponse } from '@network/shared';
import { SPRINGS, DURATIONS } from '../../../shared/motion/springs';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';
import { useGetLikeStatusesQuery } from '../likeApi';
import { useCommentThread } from '../hooks/useCommentThread';
import CommentItem from './CommentItem';

export interface CommentRepliesProps {
  contentType: ContentType;
  contentId: string;
  parentComment: ICommentResponse;
  canModerate?: boolean;
}

const CommentReplies = ({
  contentType,
  contentId,
  parentComment,
  canModerate = false,
}: CommentRepliesProps) => {
  const {
    expanded,
    toggle,
    items,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMore,
  } = useCommentThread(contentType, contentId, parentComment.id);
  const { reduce } = useMotionSafe();

  const replyIds = items.map((reply) => reply.id);
  const { data: likeStatusData } = useGetLikeStatusesQuery(
    { contentType: 'comment', contentIds: replyIds },
    { skip: replyIds.length === 0 }
  );
  const likedMap = likeStatusData?.data ?? {};

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={toggle}
        className="flex w-fit items-center gap-1.5 text-xs font-medium text-primary hover:underline cursor-pointer"
      >
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={SPRINGS.snappy}
          className="inline-flex"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
        {expanded
          ? 'Hide replies'
          : `View ${parentComment.repliesCount} ${
              parentComment.repliesCount === 1 ? 'reply' : 'replies'
            }`}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="replies"
            layout
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRINGS.smooth}
            className="flex flex-col gap-0.5 overflow-hidden"
          >
            {isLoading && (
              <div className="flex items-center gap-2 py-2 text-xs text-text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading replies...
              </div>
            )}

            {items.map((reply, index) => (
              <motion.div
                key={reply.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATIONS.fast, delay: index * 0.03 }}
              >
                <CommentItem
                  comment={reply}
                  contentType={contentType}
                  contentId={contentId}
                  topLevelCommentId={parentComment.id}
                  liked={likedMap[reply.id] ?? false}
                  isReply
                  canModerate={canModerate}
                />
              </motion.div>
            ))}

            {hasNextPage && (
              <button
                type="button"
                onClick={loadMore}
                disabled={isFetchingNextPage}
                className="w-fit text-xs font-medium text-text-muted transition-colors hover:text-text-primary cursor-pointer disabled:opacity-50"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load more replies'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommentReplies;
