import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ListMusic, X } from 'lucide-react';
import type { IPlaylistDetail } from '@network/shared';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import PlaylistCoverPickerModal from '../form/PlaylistCoverPickerModal';
import { useRemovePlaylistCoverMutation } from '../playlistApi';

export interface PlaylistCoverThumbnailProps {
  playlist: IPlaylistDetail;
  isOwner: boolean;
}

const PlaylistCoverThumbnail = ({
  playlist,
  isOwner,
}: PlaylistCoverThumbnailProps) => {
  const [thumbError, setThumbError] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const { reduce } = useMotionSafe();

  const [removeCover, { isLoading: isRemoving }] =
    useRemovePlaylistCoverMutation();

  const hasCover = Boolean(playlist.thumbnailUrl) && !thumbError;

  const handleRemoveCover = async () => {
    try {
      await removeCover(playlist.id).unwrap();
      setThumbError(false);
      setRemoveConfirmOpen(false);
    } catch {
      // Surfaced via the modal staying open to retry.
    }
  };

  return (
    <div className="relative aspect-square w-24 shrink-0 sm:w-28 md:w-40">
      <button
        type="button"
        onClick={() => isOwner && setPickerOpen(true)}
        disabled={!isOwner}
        aria-label={isOwner ? 'Change playlist cover' : undefined}
        className="group relative block h-full w-full overflow-hidden rounded-xl bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-default"
      >
        {hasCover ? (
          <img
            src={playlist.thumbnailUrl}
            alt={playlist.title}
            onError={() => setThumbError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-linear-to-br from-surface-overlay to-surface-raised">
            <motion.div
              animate={
                reduce
                  ? undefined
                  : { opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }
              }
              transition={
                reduce
                  ? undefined
                  : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
              }
              className="absolute h-16 w-16 rounded-full bg-primary/20 blur-xl"
            />
            <motion.div
              animate={reduce ? undefined : { y: [0, -5, 0] }}
              transition={
                reduce
                  ? undefined
                  : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
              }
              className="relative flex flex-col items-center gap-1.5"
            >
              <ListMusic
                className="h-7 w-7 text-text-muted opacity-60"
                strokeWidth={1.5}
              />
              {isOwner && (
                <span className="text-[11px] font-medium text-text-muted">
                  Add cover
                </span>
              )}
            </motion.div>
          </div>
        )}

        {isOwner && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
            <Camera className="h-6 w-6 text-white" strokeWidth={1.75} />
          </div>
        )}
      </button>

      {isOwner && playlist.hasCustomCover && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setRemoveConfirmOpen(true);
          }}
          disabled={isRemoving}
          aria-label="Remove cover"
          title="Remove cover"
          className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-error focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      )}

      {isOwner && (
        <PlaylistCoverPickerModal
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          playlistId={playlist.id}
        />
      )}

      {isOwner && playlist.hasCustomCover && (
        <ConfirmModal
          isOpen={removeConfirmOpen}
          onClose={() => setRemoveConfirmOpen(false)}
          onConfirm={handleRemoveCover}
          intent="danger"
          title="Remove playlist cover?"
          description="This removes the custom cover image. The playlist will fall back to its default cover."
          confirmLabel="Remove"
          isLoading={isRemoving}
        />
      )}
    </div>
  );
};

export default PlaylistCoverThumbnail;
