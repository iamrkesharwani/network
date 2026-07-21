import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ListMusic } from 'lucide-react';
import { CLIENT_ROUTES, type IPlaylistSummary } from '@network/shared';
import MediaVisibilityBadge from '../../../shared/ui/card/MediaVisibilityBadge';
import CardOptionsMenu from '../../../shared/ui/card/CardOptionsMenu';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';

export interface PlaylistCardProps {
  playlist: IPlaylistSummary;
  isOwner?: boolean;
  onDeleteClick?: (playlist: IPlaylistSummary) => void;
}

const PlaylistCard = ({
  playlist,
  isOwner = false,
  onDeleteClick,
}: PlaylistCardProps) => {
  const [thumbError, setThumbError] = useState(false);
  const { reduce } = useMotionSafe();
  const watchPath = CLIENT_ROUTES.PLAYLIST.replace(
    ':playlistId',
    playlist.id
  );

  return (
    <div className="group flex flex-col gap-2">
      <Link
        to={watchPath}
        className="relative block w-full aspect-video rounded-xl overflow-hidden bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {playlist.thumbnailUrl && !thumbError ? (
          <img
            src={playlist.thumbnailUrl}
            alt={playlist.title}
            onError={() => setThumbError(true)}
            draggable={false}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="relative w-full h-full overflow-hidden bg-linear-to-br from-surface-overlay to-surface-raised flex items-center justify-center">
            <motion.div
              animate={reduce ? undefined : { y: [0, -5, 0] }}
              transition={
                reduce
                  ? undefined
                  : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <ListMusic
                className="w-8 h-8 text-text-muted opacity-40"
                strokeWidth={1.5}
              />
            </motion.div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

        <MediaVisibilityBadge visibility={playlist.visibility} />

        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-black/70 text-white backdrop-blur-sm leading-tight">
          {playlist.itemCount} {playlist.itemCount === 1 ? 'item' : 'items'}
        </span>
      </Link>

      <div className="flex items-start justify-between gap-2 px-0.5">
        <Link to={watchPath} className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
            {playlist.title}
          </h3>
        </Link>

        {isOwner && (
          <CardOptionsMenu
            itemLabel={playlist.title}
            isOwner={isOwner}
            onDeleteClick={() => onDeleteClick?.(playlist)}
          />
        )}
      </div>
    </div>
  );
};

export default PlaylistCard;
