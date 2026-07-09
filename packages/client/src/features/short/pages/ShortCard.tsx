import { useState } from 'react';
import { cn } from '../../../shared/utils/cn';
import ShortCardThumbnail from '../components/ShortCardThumbnail';
import ShortCardMeta from '../components/ShortCardMeta';
import ConfirmModal from '../../../shared/ui-kit/ConfirmModal';
import type { IShortResponse } from '@network/shared';

export interface ShortCardProps {
  short: IShortResponse;
  isOwner?: boolean;
  onEdit?: (short: IShortResponse) => void;
  onDelete?: (short: IShortResponse) => void;
  className?: string;
}

const ShortCard = ({
  short,
  isOwner = false,
  onEdit,
  onDelete,
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
    <article className={cn('group flex flex-col gap-2', className)}>
      <ShortCardThumbnail short={short} isReady={isReady} />
      <ShortCardMeta
        short={short}
        isOwner={isOwner}
        onEdit={handleEdit}
        onDeleteClick={handleDeleteClick}
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
    </article>
  );
};

export default ShortCard;
