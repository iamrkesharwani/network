import { useRef, useState } from 'react';
import { formatDaysLeft, type IPostResponse } from '@network/shared';
import CardShell from '../../../shared/ui/card/CardShell';
import CardAuthorHeader from '../../../shared/ui/card/CardAuthorHeader';
import CardOptionsMenu from '../../../shared/ui/card/CardOptionsMenu';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import ConfirmSaveDiscardModal from '../../../shared/ui/overlay/ConfirmSaveDiscardModal';
import MultiStepConfirmDelete from '../../../shared/ui/overlay/MultiStepConfirmDelete';
import Modal from '../../../shared/ui/overlay/Modal';
import PostMedia from '../components/PostMedia';
import PostFooter from '../components/PostFooter';
import PostEditForm from '../form/PostEditForm';
import ReportModal from '../../report/components/ReportModal';
import RemovedContentBanner from '../../jury/components/RemovedContentBanner';
import AppealModal from '../../jury/components/AppealModal';
import {
  useUnsavedChangesGuard,
  type EditFormHandle,
} from '../../../shared/hooks/useUnsavedChangesGuard';

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
  const [reportOpen, setReportOpen] = useState(false);
  const [appealOpen, setAppealOpen] = useState(false);
  const editFormRef = useRef<EditFormHandle>(null);
  const editGuard = useUnsavedChangesGuard(editFormRef, () =>
    setEditModalOpen(false)
  );

  const isRemoved = isOwner && post.moderationStatus === 'jury_removed';
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
                onReport={() => setReportOpen(true)}
              />
            }
          />
        }
        media={
          post.mediaType !== 'none' ? (
            <PostMedia
              post={post}
              isUnlisted={isOwner && isUnlisted}
              daysLeft={daysLeft}
            />
          ) : undefined
        }
        footer={
          <>
            {isRemoved && (
              <RemovedContentBanner onAppealClick={() => setAppealOpen(true)} />
            )}
            <PostFooter post={post} daysLeft={daysLeft} />
          </>
        }
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
        onClose={editGuard.requestClose}
        title="Edit post"
      >
        <PostEditForm
          ref={editFormRef}
          postId={post.id}
          initialValues={{
            text: post.text,
            tags: post.tags,
            visibility: post.visibility,
          }}
          onSuccess={() => setEditModalOpen(false)}
        />
      </Modal>

      <ConfirmSaveDiscardModal
        isOpen={editGuard.isConfirmOpen}
        itemLabel="post"
        onKeepEditing={editGuard.keepEditing}
        onDiscard={editGuard.discard}
        onSave={editGuard.save}
      />

      <ReportModal
        contentType="post"
        contentId={post.id}
        authorId={post.author.id}
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
      />

      <AppealModal
        contentType="post"
        contentId={post.id}
        isOpen={appealOpen}
        onClose={() => setAppealOpen(false)}
      />
    </>
  );
};

export default PostCard;
