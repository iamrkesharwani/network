import { useState } from 'react';
import ShortCardThumbnail from '../components/ShortCardThumbnail';
import ShortCardFooter from '../components/ShortCardFooter';
import CardShell from '../../../shared/ui/card/CardShell';
import CardAuthorHeader from '../../../shared/ui/card/CardAuthorHeader';
import CardOptionsMenu from '../../../shared/ui/card/CardOptionsMenu';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import type { IShortResponse } from '@network/shared';

export interface ShortCardProps {
  short: IShortResponse;
  isOwner?: boolean;
  onEdit?: (short: IShortResponse) => void;
  onDelete?: (short: IShortResponse) => void;
  onThumbnailClick?: (short: IShortResponse) => void;
  className?: string;
}

const ShortCard = ({
  short,
  isOwner = false,
  onEdit,
  onDelete,
  onThumbnailClick,
  className,
}: ShortCardProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isReady = short.status === 'READY';

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(short);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    setConfirmOpen(false);
    onDelete?.(short);
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
                  onEdit={handleEdit}
                  onDeleteClick={handleDeleteClick}
                />
              )
            }
          />
        }
        media={
          <ShortCardThumbnail
            short={short}
            isReady={isReady}
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
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        intent="danger"
        title="Delete short?"
        description={`"${short.title}" will be permanently deleted and can't be recovered.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
};

export default ShortCard;
