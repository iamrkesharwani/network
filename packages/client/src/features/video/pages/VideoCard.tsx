import { useState } from 'react';
import { cn } from '../../../shared/utils/cn';
import VideoCardThumbnail from '../components/VideoCardThumbnail';
import VideoCardMeta from '../components/VideoCardMeta';
import ConfirmModal from '../../../shared/components/ConfirmModal';
import type { IVideoResponse } from '@network/shared';

export interface VideoCardProps {
  video: IVideoResponse;
  isOwner?: boolean;
  onEdit?: (video: IVideoResponse) => void;
  onDelete?: (video: IVideoResponse) => void;
  className?: string;
}

const VideoCard = ({
  video,
  isOwner = false,
  onEdit,
  onDelete,
  className,
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
    <article className={cn('group flex flex-col gap-3', className)}>
      <VideoCardThumbnail video={video} isReady={isReady} />
      <VideoCardMeta
        video={video}
        isOwner={isOwner}
        onEdit={handleEdit}
        onDeleteClick={handleDeleteClick}
      />
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
    </article>
  );
};

export default VideoCard;
