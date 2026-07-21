import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ContentType, ICommentResponse } from '@network/shared';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import { SPRINGS, DURATIONS } from '../../../shared/motion/springs';
import CardAuthorHeader from '../../../shared/ui/card/CardAuthorHeader';
import CardOptionsMenu from '../../../shared/ui/card/CardOptionsMenu';
import ReportModal from '../../report/components/ReportModal';
import LikeButton from './LikeButton';
import CommentInput from './CommentInput';
import CommentReplies from './CommentReplies';
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
} from '../commentApi';

export interface CommentItemProps {
  comment: ICommentResponse;
  contentType: ContentType;
  contentId: string;
  topLevelCommentId: string;
  liked: boolean;
  isReply?: boolean;
  canModerate?: boolean;
}

const CommentItem = ({
  comment,
  contentType,
  contentId,
  topLevelCommentId,
  liked,
  isReply = false,
  canModerate = false,
}: CommentItemProps) => {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const isOwner = Boolean(currentUserId) && currentUserId === comment.author.id;
  const canDelete = isOwner || canModerate;

  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const [updateCommentMutation] = useUpdateCommentMutation();
  const [deleteCommentMutation] = useDeleteCommentMutation();
  const [createCommentMutation] = useCreateCommentMutation();

  const isRemoved = comment.isDeleted || comment.moderationStatus !== 'active';

  if (isRemoved && !isReply && comment.repliesCount === 0) {
    return null;
  }

  const targetArgs = {
    contentType,
    contentId,
    ...(isReply && { parentCommentId: topLevelCommentId }),
  };

  const handleEdit = async (text: string) => {
    await updateCommentMutation({
      commentId: comment.id,
      text,
      ...targetArgs,
    }).unwrap();
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteCommentMutation({ commentId: comment.id, ...targetArgs }).unwrap();
  };

  const handleReply = async (text: string) => {
    await createCommentMutation({
      contentType,
      contentId,
      parentCommentId: topLevelCommentId,
      text,
    }).unwrap();
    setIsReplying(false);
  };

  return (
    <motion.div
      layout="position"
      transition={SPRINGS.smooth}
      className="group flex flex-col gap-1.5 py-2.5"
    >
      <CardAuthorHeader
        username={comment.author.username}
        avatarUrl={comment.author.avatarUrl}
        createdAt={comment.createdAt}
        menu={
          !isRemoved ? (
            <CardOptionsMenu
              itemLabel="Comment"
              isOwner={isOwner}
              canDelete={canDelete}
              onEdit={isOwner ? () => setIsEditing(true) : undefined}
              onDeleteClick={canDelete ? handleDelete : undefined}
              onReport={!isOwner ? () => setReportOpen(true) : undefined}
            />
          ) : undefined
        }
      />

      <div className="flex flex-col gap-1.5 pl-11">
        {isRemoved ? (
          <p className="text-sm italic text-text-muted">Comment deleted</p>
        ) : isEditing ? (
          <CommentInput
            mode="edit"
            initialValue={comment.text}
            autoFocus
            onSubmit={handleEdit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={comment.text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: DURATIONS.fast }}
              className="text-sm text-text-secondary whitespace-pre-wrap wrap-break-word"
            >
              {comment.text}
            </motion.p>
          </AnimatePresence>
        )}

        {!isRemoved && !isEditing && (
          <div className="flex items-center gap-4">
            <LikeButton
              contentType="comment"
              contentId={comment.id}
              initialLiked={liked}
              initialLikesCount={comment.likes}
              size="sm"
            />
            {!isReply && (
              <button
                type="button"
                onClick={() => setIsReplying((value) => !value)}
                className="text-xs font-medium text-text-muted transition-colors hover:text-text-primary cursor-pointer"
              >
                Reply
              </button>
            )}
          </div>
        )}

        {isReplying && (
          <CommentInput
            mode="reply"
            autoFocus
            placeholder={`Reply to @${comment.author.username}`}
            onSubmit={handleReply}
            onCancel={() => setIsReplying(false)}
          />
        )}
      </div>

      {!isReply && comment.repliesCount > 0 && (
        <div className="pl-11">
          <CommentReplies
            contentType={contentType}
            contentId={contentId}
            parentComment={comment}
            canModerate={canModerate}
          />
        </div>
      )}

      {!isOwner && (
        <ReportModal
          contentType="comment"
          contentId={comment.id}
          authorId={comment.author.id}
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default CommentItem;
