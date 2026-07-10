import { useState } from 'react';
import type { IPostResponse } from '@network/shared';
import CardShell from '../../../shared/ui-kit/CardShell';
import CardAuthorHeader from '../../../shared/ui-kit/CardAuthorHeader';
import CardOptionsMenu from '../../../shared/ui-kit/CardOptionsMenu';
import ConfirmModal from '../../../shared/ui-kit/ConfirmModal';
import PostMedia from '../components/PostMedia';
import PostFooter from '../components/PostFooter';

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
    <>
      <CardShell
        className={className}
        header={
          <CardAuthorHeader
            username={post.author.username}
            avatarUrl={post.author.avatarUrl}
            createdAt={post.createdAt}
            menu={
              isOwner && (
                <CardOptionsMenu
                  itemLabel="Post"
                  onEdit={handleEdit}
                  onDeleteClick={handleDeleteClick}
                />
              )
            }
          />
        }
        media={post.mediaType !== 'none' ? <PostMedia post={post} /> : undefined}
        footer={<PostFooter post={post} />}
      />
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
    </>
  );
};

export default PostCard;
