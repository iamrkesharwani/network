import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { formatCount, formatDaysLeft } from '@network/shared';
import CardOptionsMenu from '../../../shared/ui/card/CardOptionsMenu';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import MultiStepConfirmDelete from '../../../shared/ui/overlay/MultiStepConfirmDelete';
import Modal from '../../../shared/ui/overlay/Modal';
import PostEditForm from '../form/PostEditForm';
import type { IPostResponse } from '@network/shared';

export interface PostListRowProps {
  post: IPostResponse;
  isOwner?: boolean;
  onDelete?: (post: IPostResponse) => Promise<void> | void;
  onToggleVisibility?: (post: IPostResponse) => Promise<void> | void;
}

const PostListRow = ({
  post,
  isOwner = false,
  onDelete,
  onToggleVisibility,
}: PostListRowProps) => {
  const [thumbError, setThumbError] = useState(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [visibilityConfirmOpen, setVisibilityConfirmOpen] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isUnlisted = post.visibility === 'unlisted';
  const daysLeft =
    isOwner && isUnlisted ? formatDaysLeft(post.unlistedAt) : null;
  const previewImage =
    post.mediaType === 'image' ? post.imageUrls?.[0] : undefined;

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
      <div className="group flex items-center gap-3 py-2.5">
        <Link
          to={`/post/${post.id}`}
          className="relative shrink-0 w-20 aspect-video rounded-lg overflow-hidden bg-surface-raised flex items-center justify-center"
        >
          {previewImage && !thumbError ? (
            <img
              src={previewImage}
              alt="Post attachment"
              onError={() => setThumbError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <FileText
              className="w-4 h-4 text-text-muted opacity-40"
              strokeWidth={1.5}
            />
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={`/post/${post.id}`} className="block">
            <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
              {post.text || 'Post'}
            </p>
          </Link>
          <p className="mt-1 text-xs text-text-muted">
            {formatCount(post.views)} views · {formatCount(post.likes)} likes
            {isUnlisted && ' · Unlisted'}
            {daysLeft !== null &&
              ` · ${daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}`}
          </p>
        </div>

        {isOwner && (
          <CardOptionsMenu
            itemLabel="Post"
            isOwner={isOwner}
            onEdit={() => setEditConfirmOpen(true)}
            onDeleteClick={() => setDeleteConfirmOpen(true)}
            visibilityAction={{
              label: isUnlisted ? 'Make public' : 'Make unlisted',
              toPublic: isUnlisted,
              onClick: () => setVisibilityConfirmOpen(true),
            }}
          />
        )}
      </div>

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

export default PostListRow;
