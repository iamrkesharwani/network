import { useEffect, useRef } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { formatCount } from '@network/shared';
import type { IShortResponse } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import { useVideoSource } from '../../player/core/useVideoSource';
import { useMediaEngine } from '../../player/core/useMediaEngine';
import { useKeyboardShortcuts } from '../../player/core/useKeyboardShortcuts';
import { usePictureInPictureSync } from '../../player/core/usePictureInPictureSync';
import Overlay from '../../player/ui/Overlay';
import DoubleTapSeekZones from '../../player/ui/DoubleTapSeekZones';

interface ShortPlayerProps {
  short: IShortResponse | null;
  activeIndex: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  isActive?: boolean;
  onLike?: () => void;
  className?: string;
}

const noop = () => {};

const ShortPlayer = ({
  short,
  activeIndex,
  total,
  onNext,
  onPrev,
  isActive = true,
  onLike,
  className,
}: ShortPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  useKeyboardShortcuts({
    containerRef,
    currentTimeRef: engine.currentTimeRef,
    duration: engine.duration,
    volume: engine.volume,
    togglePlay: engine.togglePlay,
    toggleMute: engine.toggleMute,
    seek: engine.seek,
    setVolume: engine.setVolume,
    toggleFullscreen: noop,
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
        onDoubleTapCenter={onLike}
      />

      <Overlay
        isPaused={!engine.isPlaying}
        isBuffering={isBuffering}
        error={overlayError}
        onTogglePlay={engine.togglePlay}
        onRetry={handleRetry}
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

      <div className="absolute top-4 left-4 right-16 flex items-center gap-2 pointer-events-none">
        <div className="w-8 h-8 rounded-full bg-surface-overlay ring-2 ring-white/20 overflow-hidden shrink-0">
          {short.author.avatarUrl && (
            <img
              src={short.author.avatarUrl}
              alt={short.author.username}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <span className="text-sm font-medium text-white/90 truncate">
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

      <div className="absolute right-3 bottom-4 flex flex-col items-center gap-5">
        <button
          type="button"
          onClick={onLike}
          className="flex flex-col items-center gap-1 focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10 group-hover:bg-black/70 transition-colors">
            <Heart className="w-5 h-5 text-white" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] text-white/70 tabular-nums">
            {formatCount(short.likes)}
          </span>
        </button>

        <button
          type="button"
          className="flex flex-col items-center gap-1 focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10 group-hover:bg-black/70 transition-colors">
            <MessageCircle className="w-5 h-5 text-white" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] text-white/70 tabular-nums">
            {formatCount(short.views)}
          </span>
        </button>

        <button
          type="button"
          className="flex flex-col items-center gap-1 focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10 group-hover:bg-black/70 transition-colors">
            <Share2 className="w-5 h-5 text-white" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] text-white/70">Share</span>
        </button>

        <div className="flex flex-col gap-2 mt-1">
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

      <div className="absolute bottom-4 left-4 right-16">
        <p className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-2">
          {short.title}
        </p>
      </div>
    </div>
  );
};

export default ShortPlayer;
