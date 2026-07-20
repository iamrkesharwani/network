import { useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
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

interface ShortPlayerStageProps {
  short: IShortResponse;
  onNext: () => void;
  onPrev: () => void;
  className?: string;
}

const ShortPlayerStage = ({
  short,
  onNext,
  onPrev,
  className,
}: ShortPlayerStageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();

  const {
    state: sourceState,
    error: sourceError,
    retry,
  } = useVideoSource(videoRef, short.playbackUrl);
  const engine = useMediaEngine(videoRef);

  usePictureInPictureSync(videoRef);

  useEffect(() => {
    engine.play();
  }, [short.id, engine.play]);

  useTelemetry({
    contentType: 'short',
    contentId: short.id,
    userId: user?.id,
    currentTimeRef: engine.currentTimeRef,
    duration: engine.duration,
  });

  useResumePlayback({
    contentType: 'short',
    contentId: short.id,
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
      />

      <Overlay
        isPaused={!engine.isPlaying}
        isBuffering={isBuffering}
        error={overlayError}
        onTogglePlay={engine.togglePlay}
        onRetry={handleRetry}
      />

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
    </div>
  );
};

export default ShortPlayerStage;
