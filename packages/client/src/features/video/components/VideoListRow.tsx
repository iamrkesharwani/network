import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { formatCount, formatDuration } from '@network/shared';
import type { IVideoResponse } from '@network/shared';
import CardOptionsMenu from '../../../shared/ui/card/CardOptionsMenu';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import MultiStepConfirmDelete from '../../../shared/ui/overlay/MultiStepConfirmDelete';
import Modal from '../../../shared/ui/overlay/Modal';
import VideoEditForm from '../form/VideoEditForm';
import { formatDaysLeft } from '../../../shared/utils/formatDaysLeft';

export interface VideoListRowProps {
  video: IVideoResponse;
  isOwner?: boolean;
  onDelete?: (video: IVideoResponse) => Promise<void> | void;
  onToggleVisibility?: (video: IVideoResponse) => Promise<void> | void;
}

const VideoListRow = ({
  video,
  isOwner = false,
  onDelete,
  onToggleVisibility,
}: VideoListRowProps) => {
  const [thumbError, setThumbError] = useState(false);
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [visibilityConfirmOpen, setVisibilityConfirmOpen] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isUnlisted = video.visibility === 'unlisted';
  const daysLeft = isOwner && isUnlisted ? formatDaysLeft(video.unlistedAt) : null;

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
      await onToggleVisibility(video);
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
      await onDelete(video);
      setDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group flex items-center gap-3 py-2.5">
        <Link
          to={`/video/${video.id}`}
          className="relative shrink-0 w-32 aspect-video rounded-lg overflow-hidden bg-surface-raised"
        >
          {video.thumbnailUrl && !thumbError ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              onError={() => setThumbError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-5 h-5 text-text-muted opacity-40" strokeWidth={1.5} />
            </div>
          )}
          <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-medium bg-black/70 text-text-secondary">
            {formatDuration(video.duration)}
          </span>
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={`/video/${video.id}`} className="block">
            <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
              {video.title}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-text-muted">
            {formatCount(video.views)} views · {formatCount(video.likes)} likes
            {isUnlisted && ' · Unlisted'}
            {daysLeft !== null && ` · ${daysLeft === 0 ? 'Expires today' : `${daysLeft}d left`}`}
          </p>
        </div>

        {isOwner && (
          <CardOptionsMenu
            itemLabel="Video"
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
        title="Edit this video?"
        description="You'll be taken to the edit form."
        confirmLabel="Edit"
      />

      <ConfirmModal
        isOpen={visibilityConfirmOpen}
        onClose={() => setVisibilityConfirmOpen(false)}
        onConfirm={handleVisibilityConfirm}
        intent="info"
        title={isUnlisted ? 'Make this video public?' : 'Make this video unlisted?'}
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
        itemLabel="video"
        itemName={video.title}
        isLoading={isDeleting}
      />

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit video"
      >
        <VideoEditForm
          mode="edit"
          videoId={video.id}
          thumbnailUrl={video.thumbnailUrl}
          initialValues={{
            title: video.title,
            description: video.description,
            category: video.category,
            tags: video.tags,
            visibility: video.visibility,
            thumbnailUrl: video.thumbnailUrl,
          }}
          onSuccess={() => setEditModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default VideoListRow;
