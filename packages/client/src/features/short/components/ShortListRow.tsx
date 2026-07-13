import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import {
  CLIENT_ROUTES,
  formatCount,
  formatDuration,
  formatDaysLeft,
} from '@network/shared';
import type { IShortResponse } from '@network/shared';
import CardOptionsMenu from '../../../shared/ui/card/CardOptionsMenu';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import MultiStepConfirmDelete from '../../../shared/ui/overlay/MultiStepConfirmDelete';
import Modal from '../../../shared/ui/overlay/Modal';
import ShortEditForm from '../form/ShortEditForm';

export interface ShortListRowProps {
  short: IShortResponse;
  isOwner?: boolean;
  onDelete?: (short: IShortResponse) => Promise<void> | void;
  onToggleVisibility?: (short: IShortResponse) => Promise<void> | void;
}

const ShortListRow = ({
  short,
  isOwner = false,
  onDelete,
  onToggleVisibility,
}: ShortListRowProps) => {
  const [thumbError, setThumbError] = useState(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [visibilityConfirmOpen, setVisibilityConfirmOpen] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      <div className="group flex items-center gap-3 py-2.5">
        <Link
          to={CLIENT_ROUTES.SHORT_WATCH.replace(':shortId', short.id)}
          className="relative shrink-0 w-16 aspect-9/16 rounded-lg overflow-hidden bg-surface-raised"
        >
          {short.thumbnailUrl && !thumbError ? (
            <img
              src={short.thumbnailUrl}
              alt={short.title}
              onError={() => setThumbError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play
                className="w-4 h-4 text-text-muted opacity-40"
                strokeWidth={1.5}
              />
            </div>
          )}
          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-medium bg-black/70 text-text-secondary">
            {formatDuration(short.duration)}
          </span>
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            to={CLIENT_ROUTES.SHORT_WATCH.replace(':shortId', short.id)}
            className="block"
          >
            <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
              {short.title}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-text-muted">
            {formatCount(short.views)} views · {formatCount(short.likes)} likes
            {isUnlisted && ' · Unlisted'}
            {daysLeft !== null &&
              ` · ${daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}`}
          </p>
        </div>

        {isOwner && (
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
        )}
      </div>

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

export default ShortListRow;
