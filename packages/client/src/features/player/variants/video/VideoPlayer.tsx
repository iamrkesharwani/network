import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { IVideoResponse } from '@network/shared';
import { cn } from '../../../../shared/utils/cn';
import { useAppDispatch } from '../../../../shared/hooks/useAppDispatch';
import { useAuth } from '../../../auth/useAuth';
import { setVolumePreference } from '../../store/playerSlice';
import { useVideoSource } from '../../core/useVideoSource';
import { useMediaEngine } from '../../core/useMediaEngine';
import { useKeyboardShortcuts } from '../../core/useKeyboardShortcuts';
import { useOrientationLock } from '../../core/useOrientationLock';
import { useTelemetry } from '../../core/useTelemetry';
import { usePictureInPictureSync } from '../../core/usePictureInPictureSync';
import { useCaptions } from '../../core/useCaptions';
import ProgressBar from '../../ui/ProgressBar';
import ControlGroup from '../../ui/ControlGroup';
import Overlay from '../../ui/Overlay';
import CaptionOverlay from '../../ui/CaptionOverlay';
import TouchInactivityLayer, {
  type TouchInactivityLayerHandle,
} from '../../ui/TouchInactivityLayer';
import DoubleTapSeekZones from '../../ui/DoubleTapSeekZones';

interface VideoPlayerProps {
  video: IVideoResponse;
  onTheaterModeChange?: (isTheaterMode: boolean) => void;
  onEnded?: () => void;
  className?: string;
}

const VideoPlayer = ({
  video,
  onTheaterModeChange,
  onEnded,
  className,
}: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchLayerRef = useRef<TouchInactivityLayerHandle>(null);

  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const {
    state: sourceState,
    error: sourceError,
    retry,
  } = useVideoSource(videoRef, video.playbackUrl);
  const engine = useMediaEngine(videoRef);
  const { activeLanguage, activeCueText, setActiveLanguage } = useCaptions(
    videoRef,
    video.captions
  );

  useEffect(() => {
    dispatch(setVolumePreference(engine.volume));
  }, [dispatch, engine.volume]);

  usePictureInPictureSync(videoRef);

  useTelemetry({
    videoId: video.id,
    userId: user?.id,
    currentTimeRef: engine.currentTimeRef,
  });

  const [isTheaterMode, setIsTheaterMode] = useState(false);

  const handleToggleTheaterMode = useCallback(() => {
    setIsTheaterMode((theater) => {
      const next = !theater;
      onTheaterModeChange?.(next);
      return next;
    });
  }, [onTheaterModeChange]);

  useEffect(() => {
    if (!isTheaterMode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsTheaterMode(false);
        onTheaterModeChange?.(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isTheaterMode, onTheaterModeChange]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useOrientationLock(containerRef);

  const handleToggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement === container) {
      document.exitFullscreen();
      return;
    }

    container.requestFullscreen().catch(() => {});
    setIsTheaterMode(false);
    onTheaterModeChange?.(false);
  }, [onTheaterModeChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === container);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const shouldAutoplayNextRef = useRef(false);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleEnded = () => {
      shouldAutoplayNextRef.current = true;
      onEndedRef.current?.();
    };

    videoEl.addEventListener('ended', handleEnded);
    return () => videoEl.removeEventListener('ended', handleEnded);
  }, []);

  useEffect(() => {
    if (sourceState === 'ready' && shouldAutoplayNextRef.current) {
      shouldAutoplayNextRef.current = false;
      engine.play();
    }
  }, [sourceState, engine.play]);

  const handleToggleCaptions = useCallback(() => {
    if (activeLanguage !== 'off') {
      setActiveLanguage('off');
      return;
    }
    const preferred =
      video.captions.find((track) => track.isDefault) ?? video.captions[0];
    if (preferred) setActiveLanguage(preferred.language);
  }, [activeLanguage, video.captions, setActiveLanguage]);

  useKeyboardShortcuts({
    containerRef,
    currentTimeRef: engine.currentTimeRef,
    duration: engine.duration,
    volume: engine.volume,
    togglePlay: engine.togglePlay,
    toggleMute: engine.toggleMute,
    seek: engine.seek,
    setVolume: engine.setVolume,
    toggleFullscreen: handleToggleFullscreen,
    onToggleCaptions: handleToggleCaptions,
  });

  const isBuffering = sourceState === 'buffering' || engine.isBuffering;
  const overlayError = sourceError ?? engine.error;

  const handleRetry = () => {
    retry();
    engine.play();
  };

  return (
    <>
      {isTheaterMode &&
        createPortal(
          <div
            className="fixed inset-0 z-40 bg-black/90"
            onClick={handleToggleTheaterMode}
          />,
          document.body
        )}
      <div
        ref={containerRef}
        tabIndex={-1}
        className={cn(
          'group/player relative aspect-video w-full overflow-hidden rounded-lg bg-black',
          isTheaterMode &&
            'fixed top-1/2 left-1/2 z-50 w-[min(100vw,calc(100vh*16/9))] max-w-400 -translate-x-1/2 -translate-y-1/2 px-4',
          className
        )}
      >
        <video
          ref={videoRef}
          poster={video.thumbnailUrl}
          className="h-full w-full object-contain"
          playsInline
        >
          {video.captions.map((track) => (
            <track
              key={track.id}
              kind="subtitles"
              src={track.url}
              srcLang={track.language}
              label={track.label}
              default={track.isDefault}
            />
          ))}
        </video>

        <TouchInactivityLayer
          ref={touchLayerRef}
          disableAutoHide={!engine.isPlaying}
          className="group/touch absolute inset-0"
        >
          <DoubleTapSeekZones
            currentTimeRef={engine.currentTimeRef}
            seek={engine.seek}
            onToggleControls={() => touchLayerRef.current?.toggle()}
          />

          <Overlay
            isPaused={!engine.isPlaying}
            isBuffering={isBuffering}
            error={overlayError}
            onTogglePlay={engine.togglePlay}
            onRetry={handleRetry}
          />

          <CaptionOverlay activeCueText={activeCueText} />

          <div
            className={cn(
              'absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-linear-to-t from-black/80 to-transparent px-3 pt-8 pb-2',
              'opacity-100 transition-opacity duration-300',
              'group-data-[controls-visible=false]/touch:opacity-0'
            )}
          >
            <ProgressBar
              duration={engine.duration}
              subscribeToTime={engine.subscribeToTime}
              bufferedRangesRef={engine.bufferedRangesRef}
              onSeek={engine.seek}
            />
            <ControlGroup
              isPlaying={engine.isPlaying}
              isMuted={engine.isMuted}
              volume={engine.volume}
              playbackRate={engine.playbackRate}
              togglePlay={engine.togglePlay}
              toggleMute={engine.toggleMute}
              setVolume={engine.setVolume}
              setPlaybackRate={engine.setPlaybackRate}
              isTheaterMode={isTheaterMode}
              onToggleTheaterMode={handleToggleTheaterMode}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
              captionTracks={video.captions}
              activeCaptionLanguage={activeLanguage}
              onSelectCaptionLanguage={setActiveLanguage}
            />
          </div>
        </TouchInactivityLayer>
      </div>
    </>
  );
};

export default VideoPlayer;
