import { useState } from 'react';
import VideoCardThumbnail from '../components/VideoCardThumbnail';
import VideoCardFooter from '../components/VideoCardFooter';
import CardOptionsMenu from '../../../shared/ui/card/CardOptionsMenu';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import type { IVideoResponse } from '@network/shared';

export interface VideoCardProps {
  video: IVideoResponse;
  isOwner?: boolean;
  onEdit?: (video: IVideoResponse) => void;
  onDelete?: (video: IVideoResponse) => void;
}

const VideoCard = ({
  video,
  isOwner = false,
  onEdit,
  onDelete,
}: VideoCardProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isReady = video.status === 'READY';

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(video);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    setConfirmOpen(false);
    onDelete?.(video);
  };

  return (
    <>
      <div className="group flex flex-col gap-2.5">
        <VideoCardThumbnail video={video} isReady={isReady} />
        <VideoCardFooter
          video={video}
          menu={
            isOwner && (
              <CardOptionsMenu
                itemLabel="Video"
                onEdit={handleEdit}
                onDeleteClick={handleDeleteClick}
              />
            )
          }
        />
      </div>
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        intent="danger"
        title="Delete video?"
        description={`"${video.title}" will be permanently deleted and can't be recovered.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
};

export default VideoCard;
