import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GripVertical, Play, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  formatDuration,
  getRelativeDate,
  type IPlaylistItemResponse,
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';

export interface PlaylistItemListRowProps {
  item: IPlaylistItemResponse;
  index: number;
  isOwner: boolean;
  onRemove?: (item: IPlaylistItemResponse) => void;
}

const PlaylistItemListRow = ({
  item,
  index,
  isOwner,
  onRemove,
}: PlaylistItemListRowProps) => {
  const [thumbError, setThumbError] = useState(false);
  const { reduce } = useMotionSafe();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isOwner });

  const watchPath =
    item.contentType === 'short'
      ? `/shorts/${item.content.id}`
      : `/video/${item.content.id}`;
  const typeLabel = item.contentType === 'short' ? 'Short' : 'Video';

  return (
    <motion.div
      ref={setNodeRef}
      layout={!reduce}
      initial={reduce ? undefined : { opacity: 0, x: -8 }}
      animate={reduce ? undefined : { opacity: 1, x: 0 }}
      transition={reduce ? undefined : { duration: 0.25, ease: 'easeOut' }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'group flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-surface-raised/60',
        isDragging && 'relative z-10 bg-surface-raised shadow-lg'
      )}
    >
      {isOwner ? (
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="shrink-0 cursor-grab touch-none text-text-muted hover:text-text-primary active:cursor-grabbing focus:outline-none"
        >
          <GripVertical className="w-4 h-4" strokeWidth={2} />
        </button>
      ) : (
        <span className="flex w-4 shrink-0 items-center justify-center text-xs font-medium text-text-muted">
          {index + 1}
        </span>
      )}

      <Link
        to={watchPath}
        className="relative shrink-0 w-28 aspect-video rounded-lg overflow-hidden bg-surface-raised"
      >
        {item.content.thumbnailUrl && !thumbError ? (
          <img
            src={item.content.thumbnailUrl}
            alt={item.content.title}
            onError={() => setThumbError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play
              className="w-5 h-5 text-text-muted opacity-40"
              strokeWidth={1.5}
            />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
          <Play className="h-5 w-5 text-white" strokeWidth={1.5} />
        </div>

        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-medium bg-black/70 text-white">
          {formatDuration(item.content.duration)}
        </span>
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={watchPath} className="block">
          <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
            {item.content.title}
          </h3>
          <p className="mt-0.5 text-xs text-text-muted">
            {typeLabel} · added {getRelativeDate(item.addedAt)}
          </p>
        </Link>
      </div>

      {isOwner && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(item)}
          aria-label="Remove from playlist"
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-text-muted opacity-100 transition-colors md:opacity-0 md:group-hover:opacity-100 hover:text-error hover:bg-error-subtle"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2} />
        </button>
      )}
    </motion.div>
  );
};

export default PlaylistItemListRow;
