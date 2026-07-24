import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatCount } from '@network/shared';
import type { IShortResponse } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { useAuth } from '../../auth/useAuth';
import { useVideoSource } from '../../player/core/useVideoSource';
import { useMediaEngine } from '../../player/core/useMediaEngine';
import { useKeyboardShortcuts } from '../../player/core/useKeyboardShortcuts';
import { usePictureInPictureSync } from '../../player/core/usePictureInPictureSync';
import { useTelemetry } from '../../player/core/useTelemetry';
import { useResumePlayback } from '../../player/core/useResumePlayback';
import Overlay from '../../player/ui/Overlay';
import DoubleTapSeekZones from '../../player/ui/DoubleTapSeekZones';
import BottomSheet from '../../../shared/ui/overlay/BottomSheet';
import CommentSection from '../../engagement/components/CommentSection';
import { useLikeToggle } from '../../engagement/hooks/useLikeToggle';
import AnimatedHeartIcon from '../../engagement/components/AnimatedHeartIcon';
import { useContentRoom } from '../../engagement/hooks/useContentRoom';
import { useGetLikeStatusesQuery } from '../../engagement/likeApi';
import { useCreateShareMutation } from '../../engagement/shareApi';
import { useSocketContext } from '../../../shared/hooks/SocketContext';
import { useMotionSafe } from '../../../shared/motion/useMotionSafe';
import { SPRINGS } from '../../../shared/motion/springs';
import {
  ChevronUp,
  ChevronDown,
  Eye,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface ShortPlayerProps {
  short: IShortResponse | null;
  activeIndex: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  isActive?: boolean;
  className?: string;
  autoOpenComments?: boolean;
  highlightCommentId?: string;
  threadRootId?: string;
}

const ShortPlayer = ({
  short,
  activeIndex,
  total,
  onNext,
  onPrev,
  isActive = true,
  className,
  autoOpenComments = false,
  highlightCommentId,
  threadRootId,
}: ShortPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [commentsOpen, setCommentsOpen] = useState(autoOpenComments);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const { reduce } = useMotionSafe();

  const { user } = useAuth();
  const isShortOwner = Boolean(user) && user?.id === short?.author.id;

  const socket = useSocketContext();
  useContentRoom(socket, 'short', short?.id ?? '', containerRef);

  const { data: likeStatusData } = useGetLikeStatusesQuery(
    { contentType: 'short', contentIds: short ? [short.id] : [] },
    { skip: !short }
  );
  const { liked, likesCount, toggle: toggleLike } = useLikeToggle({
    contentType: 'short',
    contentId: short?.id ?? '',
    initialLiked: short ? (likeStatusData?.data[short.id] ?? false) : false,
    initialLikesCount: short?.likes ?? 0,
  });

  const [createShare] = useCreateShareMutation();

  const handleDoubleTapLike = () => {
    if (!liked) toggleLike();
  };

  const handleShare = async () => {
    if (!short) return;
    try {
      const result = await createShare({
        contentType: 'short',
        contentId: short.id,
      }).unwrap();
      if (typeof navigator.share === 'function') {
        await navigator.share({ url: result.data.url }).catch(() => {});
      } else {
        await navigator.clipboard.writeText(result.data.url);
      }
    } catch {
      // Best-effort - this player has no toast/snackbar slot of its own to
      // surface a failure, and a failed share isn't worth interrupting playback for.
    }
  };

  const {
    state: sourceState,
    error: sourceError,
    retry,
  } = useVideoSource(videoRef, short?.playbackUrl);
  const engine = useMediaEngine(videoRef);

  usePictureInPictureSync(videoRef);

  useEffect(() => {
    if (isActive) engine.play();
    else engine.pause();
  }, [isActive, engine.play, engine.pause]);

  useTelemetry({
    contentType: 'short',
    contentId: short?.id ?? '',
    userId: user?.id,
    currentTimeRef: engine.currentTimeRef,
    duration: engine.duration,
  });

  useResumePlayback({
    contentType: 'short',
    contentId: short?.id ?? '',
    userId: user?.id,
    seek: engine.seek,
  });

  useKeyboardShortcuts({
    containerRef,
    currentTimeRef: engine.currentTimeRef,
    duration: engine.duration,
    volume: engine.volume,
    togglePlay: engine.togglePlay,
    toggleMute: engine.toggleMute,
    seek: engine.seek,
    setVolume: engine.setVolume,
    onNavigatePrev: onPrev,
    onNavigateNext: onNext,
  });

  const handleRetry = () => {
    retry();
    engine.play();
  };

  const isBuffering = sourceState === 'buffering' || engine.isBuffering;
  const overlayError = sourceError ?? engine.error;

  if (!short) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl bg-surface-raised border border-border',
          className
        )}
      >
        <p className="text-xs text-text-muted">No shorts yet</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={cn(
        'relative w-full h-full rounded-2xl overflow-hidden bg-black',
        className
      )}
    >
      <video
        ref={videoRef}
        poster={short.thumbnailUrl}
        className="w-full h-full object-cover"
        playsInline
        loop
        muted
      />

      <DoubleTapSeekZones
        currentTimeRef={engine.currentTimeRef}
        seek={engine.seek}
        onToggleControls={engine.togglePlay}
        onDoubleTapCenter={handleDoubleTapLike}
      />

      <Overlay
        isPaused={!engine.isPlaying}
        isBuffering={isBuffering}
        error={overlayError}
        onTogglePlay={engine.togglePlay}
        onRetry={handleRetry}
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

      <div className="absolute bottom-25 left-4 right-4 flex items-center gap-1.5 pointer-events-none">
        <div className="w-6 h-6 rounded-full bg-surface-overlay ring-2 ring-white/20 overflow-hidden shrink-0">
          {short.author.avatarUrl && (
            <img
              src={short.author.avatarUrl}
              alt={short.author.username}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <span className="text-xs font-medium text-white/90 truncate min-w-0">
          @{short.author.username}
        </span>
      </div>

      <button
        type="button"
        onClick={engine.toggleMute}
        aria-label={engine.isMuted ? 'Unmute' : 'Mute'}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10 text-white hover:bg-black/70 transition-colors focus:outline-none"
      >
        {engine.isMuted ? (
          <VolumeX className="w-4.5 h-4.5" strokeWidth={1.75} />
        ) : (
          <Volume2 className="w-4.5 h-4.5" strokeWidth={1.75} />
        )}
      </button>

      <div className="absolute right-3 bottom-20 md:bottom-4 flex flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-1 text-white/70">
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10">
            <Eye className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] tabular-nums">
            {formatCount(short.views)}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike' : 'Like'}
          className="flex flex-col items-center gap-1 focus:outline-none group"
        >
          <motion.div
            whileTap={reduce ? undefined : { scale: 0.85 }}
            transition={SPRINGS.snappy}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10 group-hover:bg-black/70 transition-colors"
          >
            <AnimatedHeartIcon
              liked={liked}
              className={cn('w-5 h-5', liked ? 'fill-error text-error' : 'text-white')}
            />
          </motion.div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={likesCount}
              initial={reduce ? false : { y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="text-[11px] text-white/70 tabular-nums"
            >
              {formatCount(likesCount)}
            </motion.span>
          </AnimatePresence>
        </button>

        <button
          type="button"
          onClick={() => setCommentsOpen(true)}
          aria-label="Comments"
          className="flex flex-col items-center gap-1 focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10 group-hover:bg-black/70 transition-colors">
            <MessageCircle className="w-5 h-5 text-white" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] text-white/70 tabular-nums">
            {formatCount(short.commentsCount)}
          </span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Share"
          className="flex flex-col items-center gap-1 focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10 group-hover:bg-black/70 transition-colors">
            <Share2 className="w-5 h-5 text-white" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] text-white/70">Share</span>
        </button>

        <div className="hidden md:flex flex-col gap-2 mt-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={activeIndex === 0}
            aria-label="Previous short"
            className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none"
          >
            <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={activeIndex >= total - 1}
            aria-label="Next short"
            className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus:outline-none"
          >
            <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-16 md:bottom-4 left-4 right-16">
        {short.description ? (
          <button
            type="button"
            onClick={() => setDescriptionOpen(true)}
            className="flex items-start gap-1.5 text-left focus:outline-none group"
          >
            <p className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-2">
              {short.title}
            </p>
            <ChevronDown
              className="w-4 h-4 mt-0.5 shrink-0 text-white/80 group-hover:text-white transition-colors"
              strokeWidth={2.5}
            />
          </button>
        ) : (
          <p className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-2">
            {short.title}
          </p>
        )}
      </div>

      <BottomSheet
        isOpen={descriptionOpen && Boolean(short.description)}
        onClose={() => setDescriptionOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-surface-overlay ring-1 ring-border">
              {short.author.avatarUrl && (
                <img
                  src={short.author.avatarUrl}
                  alt={short.author.username}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">
                {short.title}
              </p>
              <p className="truncate text-xs text-text-muted">
                @{short.author.username}
              </p>
            </div>
          </div>
        }
      >
        <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-text-secondary">
          {short.description}
        </p>
      </BottomSheet>

      <BottomSheet
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        title={
          <h2 className="text-sm font-semibold text-text-primary">Comments</h2>
        }
      >
        <CommentSection
          contentType="short"
          contentId={short.id}
          canModerate={isShortOwner}
          highlightCommentId={highlightCommentId}
          threadRootId={threadRootId}
        />
      </BottomSheet>
    </div>
  );
};

export default ShortPlayer;
