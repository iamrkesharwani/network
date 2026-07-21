import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Play, Trash2 } from 'lucide-react';
import {
  CLIENT_ROUTES,
  PLAYLIST_QUEUE_PARAM,
  formatRuntime,
  type IPlaylistDetail,
  type IPlaylistItemResponse,
} from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';
import PlaylistCoverThumbnail from './PlaylistCoverThumbnail';

export interface PlaylistHeroProps {
  playlist: IPlaylistDetail;
  items: IPlaylistItemResponse[];
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const circleButtonClass =
  'inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-overlay/70 text-text-secondary backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';

const PlaylistHero = ({
  playlist,
  items,
  isOwner,
  onEdit,
  onDelete,
}: PlaylistHeroProps) => {
  const { reduce } = useMotionSafe();

  const firstVideoItem = items.find((item) => item.contentType === 'video');
  const totalSeconds = items.reduce(
    (sum, item) => sum + item.content.duration,
    0
  );

  const playAllPath = firstVideoItem
    ? `${CLIENT_ROUTES.VIDEO_WATCH.replace(':videoId', firstVideoItem.content.id)}?${PLAYLIST_QUEUE_PARAM}=${playlist.id}`
    : null;

  const profilePath = CLIENT_ROUTES.PROFILE.replace(
    ':username',
    playlist.author.username
  );

  return (
    <div className="relative -mx-4 -mt-0 w-[calc(100%+2rem)] overflow-hidden rounded-b-2xl bg-surface-raised md:-mx-5 md:-mt-5 md:w-[calc(100%+2.5rem)]">
      <div className="absolute inset-0 bg-linear-to-br from-primary/25 via-primary/5 to-transparent" />

      <motion.div
        aria-hidden
        className="absolute -left-10 top-6 h-40 w-40 rounded-full bg-primary/25 blur-3xl"
        animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 20, 0] }}
        transition={
          reduce
            ? undefined
            : { duration: 9, repeat: Infinity, ease: 'easeInOut' }
        }
      />
      <motion.div
        aria-hidden
        className="absolute right-0 bottom-0 h-52 w-52 rounded-full bg-primary/15 blur-3xl"
        animate={reduce ? undefined : { x: [0, -30, 0], y: [0, -15, 0] }}
        transition={
          reduce
            ? undefined
            : { duration: 11, repeat: Infinity, ease: 'easeInOut' }
        }
      />

      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-surface-alt" />

      <div className="relative z-10 flex items-center justify-between px-3 pt-3 sm:px-4 md:px-5">
        <Link
          to={profilePath}
          aria-label="Back to profile"
          className={cn(circleButtonClass, 'h-9 w-9 sm:h-10 sm:w-10')}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        </Link>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            to={profilePath}
            className="text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            @{playlist.author.username}
          </Link>

          <span className="rounded-full border border-border bg-surface-overlay/70 px-2 py-1.5 text-[11px] font-medium text-text-muted backdrop-blur-sm">
            {playlist.visibility === 'public' ? 'Public' : 'Unlisted'}
          </span>
        </div>
      </div>

      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 12 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={reduce ? undefined : { duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 mx-auto my-3 flex w-[calc(100%-2rem)] max-w-4xl flex-col items-center gap-2.5 rounded-2xl border border-border bg-surface-overlay/80 p-3 text-center backdrop-blur-md sm:my-4 sm:gap-3 sm:p-4 md:my-8 md:flex-row md:items-center md:gap-6 md:p-6 md:text-left"
      >
        <PlaylistCoverThumbnail playlist={playlist} isOwner={isOwner} />

        <div className="flex min-w-0 flex-1 flex-col items-center gap-1 sm:gap-1.5 md:items-start md:gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
              Playlist
            </span>
            <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-text-muted">
              {playlist.visibility === 'public' ? 'Public' : 'Unlisted'}
            </span>
          </div>

          <h1 className="truncate text-lg font-bold leading-tight text-text-primary sm:text-xl md:text-3xl">
            {playlist.title}
          </h1>

          {playlist.description && (
            <p className="line-clamp-1 whitespace-pre-wrap text-sm text-text-secondary md:line-clamp-2">
              {playlist.description}
            </p>
          )}

          <p className="hidden text-xs text-text-muted md:block">
            <Link
              to={profilePath}
              className="font-medium text-text-secondary hover:text-text-primary hover:underline"
            >
              @{playlist.author.username}
            </Link>
            {' · '}
            {playlist.itemCount} {playlist.itemCount === 1 ? 'item' : 'items'}
            {totalSeconds > 0 && ` · ${formatRuntime(totalSeconds)}`}
          </p>

          <div className="mt-0.5 flex items-center gap-2.5 sm:mt-1 sm:gap-3">
            {playAllPath && (
              <Link
                to={playAllPath}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-5 sm:py-2"
              >
                <Play className="h-4 w-4" strokeWidth={2} />
                Play all
              </Link>
            )}

            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={onEdit}
                  aria-label="Edit playlist"
                  title="Edit playlist"
                  className={cn(circleButtonClass, 'h-9 w-9 sm:h-10 sm:w-10')}
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} />
                </button>

                <button
                  type="button"
                  onClick={onDelete}
                  aria-label="Delete playlist"
                  title="Delete playlist"
                  className={cn(
                    circleButtonClass,
                    'h-9 w-9 hover:border-error/40 hover:text-error sm:h-10 sm:w-10'
                  )}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PlaylistHero;
