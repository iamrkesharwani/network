import { useState } from 'react';
import { formatDaysLeft, type IPostResponse } from '@network/shared';
import CardShell from '../../../shared/ui/card/CardShell';
import CardAuthorHeader from '../../../shared/ui/card/CardAuthorHeader';
import CardOptionsMenu from '../../../shared/ui/card/CardOptionsMenu';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import MultiStepConfirmDelete from '../../../shared/ui/overlay/MultiStepConfirmDelete';
import Modal from '../../../shared/ui/overlay/Modal';
import PostMedia from '../components/PostMedia';
import PostFooter from '../components/PostFooter';
import PostEditForm from '../form/PostEditForm';

export interface PostCardProps {
  post: IPostResponse;
  isOwner?: boolean;
  onDelete?: (post: IPostResponse) => Promise<void> | void;
  onToggleVisibility?: (post: IPostResponse) => Promise<void> | void;
  className?: string;
}

const PostCard = ({
  post,
  isOwner = false,
  onDelete,
  onToggleVisibility,
  className,
}: PostCardProps) => {
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [visibilityConfirmOpen, setVisibilityConfirmOpen] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isUnlisted = post.visibility === 'unlisted';
  const daysLeft =
    isOwner && isUnlisted ? formatDaysLeft(post.unlistedAt) : null;

  const handleEditConfirm = () => {
    setEditConfirmOpen(false);
    setEditModalOpen(true);
  };

  const handleVisibilityConfirm = async () => {
    if (!onToggleVisibility) {
      setVisibilityConfirmOpen(false);
      return;
    }
    setIsTogglingVisibility(true);
    try {
      await onToggleVisibility(post);
      setVisibilityConfirmOpen(false);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) {
      setDeleteConfirmOpen(false);
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(post);
      setDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
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
                  onEdit={() => setEditConfirmOpen(true)}
                  onDeleteClick={() => setDeleteConfirmOpen(true)}
                  visibilityAction={{
                    label: isUnlisted ? 'Make public' : 'Make unlisted',
                    toPublic: isUnlisted,
                    onClick: () => setVisibilityConfirmOpen(true),
                  }}
                />
              )
            }
          />
        }
        media={
          post.mediaType !== 'none' ? (
            <PostMedia post={post} daysLeft={daysLeft} />
          ) : undefined
        }
        footer={<PostFooter post={post} daysLeft={daysLeft} />}
      />

      <ConfirmModal
        isOpen={editConfirmOpen}
        onClose={() => setEditConfirmOpen(false)}
        onConfirm={handleEditConfirm}
        intent="info"
        title="Edit this post?"
        description="You'll be taken to the edit form."
        confirmLabel="Edit"
      />

      <ConfirmModal
        isOpen={visibilityConfirmOpen}
        onClose={() => setVisibilityConfirmOpen(false)}
        onConfirm={handleVisibilityConfirm}
        intent="info"
        title={
          isUnlisted ? 'Make this post public?' : 'Make this post unlisted?'
        }
        description={
          isUnlisted
            ? 'Make this public now to keep it — otherwise it is automatically deleted in a few days.'
            : 'Only you will be able to see this. It will be automatically deleted after 7 days unless you make it public again.'
        }
        confirmLabel={isUnlisted ? 'Make public' : 'Make unlisted'}
        isLoading={isTogglingVisibility}
      />

      <MultiStepConfirmDelete
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemLabel="post"
        itemName={post.text?.slice(0, 40) || 'this post'}
        isLoading={isDeleting}
      />

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit post"
      >
        <PostEditForm
          postId={post.id}
          initialValues={{
            text: post.text,
            tags: post.tags,
            visibility: post.visibility,
          }}
          onSuccess={() => setEditModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default PostCard;
