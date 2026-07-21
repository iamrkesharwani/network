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

export interface PlaylistItemTileProps {
  item: IPlaylistItemResponse;
  isOwner: boolean;
  onRemove?: (item: IPlaylistItemResponse) => void;
}

const PlaylistItemTile = ({
  item,
  isOwner,
  onRemove,
}: PlaylistItemTileProps) => {
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
      initial={reduce ? undefined : { opacity: 0, y: 8 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={reduce ? undefined : { duration: 0.25, ease: 'easeOut' }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'group relative flex flex-col gap-1.5 rounded-lg',
        isDragging && 'z-10 opacity-90'
      )}
    >
      <Link
        to={watchPath}
        className="relative block aspect-video w-full overflow-hidden rounded-lg bg-surface-raised transition-transform duration-200 group-hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {item.content.thumbnailUrl && !thumbError ? (
          <img
            src={item.content.thumbnailUrl}
            alt={item.content.title}
            onError={() => setThumbError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Play
              className="w-6 h-6 text-text-muted opacity-40"
              strokeWidth={1.5}
            />
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
          <Play className="h-8 w-8 text-white drop-shadow" strokeWidth={1.5} />
        </div>

        <span className="absolute bottom-1.5 right-1.5 rounded px-1 py-0.5 text-[10px] font-medium bg-black/70 text-white">
          {formatDuration(item.content.duration)}
        </span>
      </Link>

      {isOwner && (
        <div className="absolute inset-x-1.5 top-1.5 flex items-center justify-between opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
            className="inline-flex h-6 w-6 cursor-grab touch-none items-center justify-center rounded-full bg-black/70 text-white active:cursor-grabbing focus:outline-none"
          >
            <GripVertical className="w-3.5 h-3.5" strokeWidth={2} />
          </button>

          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(item)}
              aria-label="Remove from playlist"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:text-error focus:outline-none"
            >
              <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      )}

      <Link to={watchPath} className="block px-0.5">
        <h3 className="text-sm font-medium text-text-primary leading-snug line-clamp-2">
          {item.content.title}
        </h3>
        <p className="mt-0.5 text-xs text-text-muted">
          {typeLabel} · added {getRelativeDate(item.addedAt)}
        </p>
      </Link>
    </motion.div>
  );
};

export default PlaylistItemTile;
