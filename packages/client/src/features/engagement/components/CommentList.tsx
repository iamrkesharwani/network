import { AnimatePresence, motion } from 'framer-motion';
import type { ContentType, ICommentResponse } from '@network/shared';
import { SPRINGS } from '../../../shared/motion/springs';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';
import InfiniteScroll from '../../../shared/ui/list/InfiniteScroll';
import { useGetLikeStatusesQuery } from '../likeApi';
import CommentItem from './CommentItem';

export interface CommentListProps {
  contentType: ContentType;
  contentId: string;
  comments: ICommentResponse[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
}

const CommentList = ({
  contentType,
  contentId,
  comments,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
}: CommentListProps) => {
  const { reduce } = useMotionSafe();
  const commentIds = comments.map((comment) => comment.id);
  const { data: likeStatusData } = useGetLikeStatusesQuery(
    { contentType: 'comment', contentIds: commentIds },
    { skip: commentIds.length === 0 }
  );
  const likedMap = likeStatusData?.data ?? {};

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-12 w-full rounded-lg skeleton-shimmer"
          />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        No comments yet. Be the first to say something.
      </p>
    );
  }

  return (
    <InfiniteScroll
      isLoading={isFetchingNextPage}
      hasMore={hasNextPage}
      onLoadMore={onLoadMore}
    >
      <motion.div layout className="flex flex-col divide-y divide-border">
        <AnimatePresence initial={false}>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              layout="position"
              initial={reduce ? false : { opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={SPRINGS.bouncy}
            >
              <CommentItem
                comment={comment}
                contentType={contentType}
                contentId={contentId}
                topLevelCommentId={comment.id}
                liked={likedMap[comment.id] ?? false}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </InfiniteScroll>
  );
};

export default CommentList;
