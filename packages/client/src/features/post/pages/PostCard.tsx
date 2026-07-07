import { useState } from 'react';
import { formatCount } from '@network/shared';
import type { IPostResponse } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import PostCardMeta from '../components/PostCardMeta';
import PostCardBody from '../components/PostCard';

export interface PostCardProps {
  post: IPostResponse;
  isOwner?: boolean;
  onEdit?: (post: IPostResponse) => void;
  onDelete?: (post: IPostResponse) => void;
  className?: string;
}

const PostCard = ({
  post,
  isOwner = false,
  onEdit,
  onDelete,
  className,
}: PostCardProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(post);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    setConfirmOpen(false);
    onDelete?.(post);
  };

  return (
    <article
      className={cn(
        'group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5',
        className
      )}
    >
      <PostCardMeta
        post={post}
        isOwner={isOwner}
        onEdit={handleEdit}
        onDeleteClick={handleDeleteClick}
      />
      <PostCardBody post={post} />

      {post.views > 0 && (
        <p className="text-xs text-text-muted">
          {formatCount(post.views)} views
        </p>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        intent="danger"
        title="Delete post?"
        description="This post will be permanently deleted and can't be recovered."
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </article>
  );
};

export default PostCard;
