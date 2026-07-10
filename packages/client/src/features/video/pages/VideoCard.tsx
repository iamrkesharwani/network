import { useState } from 'react';
import VideoCardThumbnail from '../components/VideoCardThumbnail';
import VideoCardFooter from '../components/VideoCardFooter';
import CardShell from '../../../shared/ui-kit/CardShell';
import CardAuthorHeader from '../../../shared/ui-kit/CardAuthorHeader';
import CardOptionsMenu from '../../../shared/ui-kit/CardOptionsMenu';
import ConfirmModal from '../../../shared/ui-kit/ConfirmModal';
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
    <>
      <CardShell
        className={className}
        header={
          <CardAuthorHeader
            username={video.author.username}
            avatarUrl={video.author.avatarUrl}
            createdAt={video.createdAt}
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
        }
        media={<VideoCardThumbnail video={video} isReady={isReady} />}
        footer={<VideoCardFooter video={video} />}
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
    </>
  );
};

export default VideoCard;
