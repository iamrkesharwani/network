import { useState } from 'react';
import ShortCardThumbnail from '../components/ShortCardThumbnail';
import ShortCardFooter from '../components/ShortCardFooter';
import CardShell from '../../../shared/ui/card/CardShell';
import CardAuthorHeader from '../../../shared/ui/card/CardAuthorHeader';
import CardOptionsMenu from '../../../shared/ui/card/CardOptionsMenu';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import MultiStepConfirmDelete from '../../../shared/ui/overlay/MultiStepConfirmDelete';
import Modal from '../../../shared/ui/overlay/Modal';
import ShortEditForm from '../form/ShortEditForm';
import { formatDaysLeft, type IShortResponse } from '@network/shared';

export interface ShortCardProps {
  short: IShortResponse;
  isOwner?: boolean;
  onDelete?: (short: IShortResponse) => Promise<void> | void;
  onToggleVisibility?: (short: IShortResponse) => Promise<void> | void;
  onThumbnailClick?: (short: IShortResponse) => void;
  className?: string;
}

const ShortCard = ({
  short,
  isOwner = false,
  onDelete,
  onToggleVisibility,
  onThumbnailClick,
  className,
}: ShortCardProps) => {
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [visibilityConfirmOpen, setVisibilityConfirmOpen] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isReady = short.status === 'READY';
  const isUnlisted = short.visibility === 'unlisted';
  const daysLeft =
    isOwner && isUnlisted ? formatDaysLeft(short.unlistedAt) : null;

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
      await onToggleVisibility(short);
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
      await onDelete(short);
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
            username={short.author.username}
            avatarUrl={short.author.avatarUrl}
            createdAt={short.createdAt}
            menu={
              isOwner && (
                <CardOptionsMenu
                  itemLabel="Short"
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
          <ShortCardThumbnail
            short={short}
            isReady={isReady}
            isUnlisted={isOwner && isUnlisted}
            daysLeft={daysLeft}
            onClick={
              onThumbnailClick ? () => onThumbnailClick(short) : undefined
            }
          />
        }
        footer={
          <ShortCardFooter
            short={short}
            onTitleClick={
              onThumbnailClick ? () => onThumbnailClick(short) : undefined
            }
          />
        }
      />

      <ConfirmModal
        isOpen={editConfirmOpen}
        onClose={() => setEditConfirmOpen(false)}
        onConfirm={handleEditConfirm}
        intent="info"
        title="Edit this short?"
        description="You'll be taken to the edit form."
        confirmLabel="Edit"
      />

      <ConfirmModal
        isOpen={visibilityConfirmOpen}
        onClose={() => setVisibilityConfirmOpen(false)}
        onConfirm={handleVisibilityConfirm}
        intent="info"
        title={
          isUnlisted ? 'Make this short public?' : 'Make this short unlisted?'
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
        itemLabel="short"
        itemName={short.title}
        isLoading={isDeleting}
      />

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit short"
      >
        <ShortEditForm
          mode="edit"
          shortId={short.id}
          thumbnailUrl={short.thumbnailUrl}
          initialValues={{
            title: short.title,
            description: short.description,
            tags: short.tags,
            visibility: short.visibility,
            thumbnailUrl: short.thumbnailUrl,
          }}
          onSuccess={() => setEditModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default ShortCard;
