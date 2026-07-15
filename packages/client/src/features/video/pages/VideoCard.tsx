import { useState } from 'react';
import VideoCardThumbnail from '../components/VideoCardThumbnail';
import VideoCardFooter from '../components/VideoCardFooter';
import CardOptionsMenu from '../../../shared/ui/card/CardOptionsMenu';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import MultiStepConfirmDelete from '../../../shared/ui/overlay/MultiStepConfirmDelete';
import Modal from '../../../shared/ui/overlay/Modal';
import VideoEditForm from '../form/VideoEditForm';
import ReportModal from '../../report/components/ReportModal';
import RemovedContentBanner from '../../jury/components/RemovedContentBanner';
import AppealModal from '../../jury/components/AppealModal';
import { formatDaysLeft, type IVideoResponse } from '@network/shared';

export interface VideoCardProps {
  video: IVideoResponse;
  isOwner?: boolean;
  onDelete?: (video: IVideoResponse) => Promise<void> | void;
  onToggleVisibility?: (video: IVideoResponse) => Promise<void> | void;
}

const VideoCard = ({
  video,
  isOwner = false,
  onDelete,
  onToggleVisibility,
}: VideoCardProps) => {
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [visibilityConfirmOpen, setVisibilityConfirmOpen] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [appealOpen, setAppealOpen] = useState(false);

  const isRemoved = isOwner && video.moderationStatus === 'jury_removed';
  const isReady = video.status === 'READY';
  const isUnlisted = video.visibility === 'unlisted';
  const daysLeft =
    isOwner && isUnlisted ? formatDaysLeft(video.unlistedAt) : null;

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditConfirmOpen(true);
  };

  const handleEditConfirm = () => {
    setEditConfirmOpen(false);
    setEditModalOpen(true);
  };

  const handleVisibilityClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisibilityConfirmOpen(true);
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmOpen(true);
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
      <div className="group flex flex-col gap-2.5">
        <VideoCardThumbnail
          video={video}
          isReady={isReady}
          isUnlisted={isOwner && isUnlisted}
          daysLeft={daysLeft}
        />
        {isRemoved && (
          <RemovedContentBanner onAppealClick={() => setAppealOpen(true)} />
        )}
        <VideoCardFooter
          video={video}
          menu={
            <CardOptionsMenu
              itemLabel="Video"
              isOwner={isOwner}
              onEdit={handleEditClick}
              onDeleteClick={handleDeleteClick}
              visibilityAction={{
                label: isUnlisted ? 'Make public' : 'Make unlisted',
                toPublic: isUnlisted,
                onClick: handleVisibilityClick,
              }}
              onReport={() => setReportOpen(true)}
            />
          }
        />
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
        title={
          isUnlisted ? 'Make this video public?' : 'Make this video unlisted?'
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
          captions={video.captions}
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

      <ReportModal
        contentType="video"
        contentId={video.id}
        authorId={video.author.id}
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
      />

      <AppealModal
        contentType="video"
        contentId={video.id}
        isOpen={appealOpen}
        onClose={() => setAppealOpen(false)}
      />
    </>
  );
};

export default VideoCard;
