import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Lock } from 'lucide-react';
import type { IVideoResponse } from '@network/shared';
import { cn } from '../../../../shared/utils/cn';
import { useAuth } from '../../../auth/useAuth';
import { usePreference } from '../../../settings/hooks/usePreference';
import { useVideoSource } from '../../core/useVideoSource';
import { useMediaEngine } from '../../core/useMediaEngine';
import { useKeyboardShortcuts } from '../../core/useKeyboardShortcuts';
import { useOrientationLock } from '../../core/useOrientationLock';
import { useTelemetry } from '../../core/useTelemetry';
import { useResumePlayback } from '../../core/useResumePlayback';
import { usePictureInPictureSync } from '../../core/usePictureInPictureSync';
import { useCaptions } from '../../core/useCaptions';
import ProgressBar from '../../ui/ProgressBar';
import ControlGroup from '../../ui/ControlGroup';
import TopControls from '../../ui/TopControls';
import SettingsMenu from '../../ui/settings/SettingsMenu';
import Overlay from '../../ui/Overlay';
import CaptionOverlay from '../../ui/CaptionOverlay';
import TouchInactivityLayer, {
  type TouchInactivityLayerHandle,
} from '../../ui/TouchInactivityLayer';
import DoubleTapSeekZones from '../../ui/DoubleTapSeekZones';

interface VideoPlayerProps {
  video: IVideoResponse;
  onEnded?: () => void;
  upNextSlot?: ReactNode;
  className?: string;
}

const VideoPlayer = ({
  video,
  onEnded,
  upNextSlot,
  className,
}: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchLayerRef = useRef<TouchInactivityLayerHandle>(null);
  const lockLayerRef = useRef<TouchInactivityLayerHandle>(null);

  const { user } = useAuth();
  const [playback, setPlayback] = usePreference('playback');

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

  const hasAppliedInitialVolumeRef = useRef(false);
  useEffect(() => {
    if (hasAppliedInitialVolumeRef.current) return;
    hasAppliedInitialVolumeRef.current = true;
    if (playback.volume !== undefined) engine.setVolume(playback.volume);
  }, [playback.volume, engine]);

  useEffect(() => {
    setPlayback({ volume: engine.volume });
  }, [engine.volume, setPlayback]);

  const hasAppliedInitialPlaybackRateRef = useRef(false);
  useEffect(() => {
    if (hasAppliedInitialPlaybackRateRef.current) return;
    hasAppliedInitialPlaybackRateRef.current = true;
    if (playback.playbackRate !== undefined) {
      engine.setPlaybackRate(playback.playbackRate);
    }
  }, [playback.playbackRate, engine]);

  useEffect(() => {
    setPlayback({ playbackRate: engine.playbackRate });
  }, [engine.playbackRate, setPlayback]);

  usePictureInPictureSync(videoRef);

  useTelemetry({
    contentType: 'video',
    contentId: video.id,
    userId: user?.id,
    currentTimeRef: engine.currentTimeRef,
    duration: engine.duration,
  });

  useResumePlayback({
    contentType: 'video',
    contentId: video.id,
    userId: user?.id,
    seek: engine.seek,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

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
  }, []);

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

  const [isEnded, setIsEnded] = useState(false);
  const shouldAutoplayNextRef = useRef(false);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleEnded = () => {
      shouldAutoplayNextRef.current = true;
      setIsEnded(true);
      onEndedRef.current?.();
    };
    const handleSeeking = () => setIsEnded(false);

    videoEl.addEventListener('ended', handleEnded);
    videoEl.addEventListener('seeking', handleSeeking);
    return () => {
      videoEl.removeEventListener('ended', handleEnded);
      videoEl.removeEventListener('seeking', handleSeeking);
    };
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
    enabled: !isLocked,
  });

  const isBuffering = sourceState === 'buffering' || engine.isBuffering;
  const overlayError = sourceError ?? engine.error;

  const handleRetry = () => {
    retry();
    engine.play();
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={cn(
        'group/player relative aspect-video w-full overflow-hidden bg-surface',
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

      <CaptionOverlay activeCueText={activeCueText} />

      {isLocked ? (
        <TouchInactivityLayer
          ref={lockLayerRef}
          className="group/touch absolute inset-0"
        >
          <div
            className="absolute inset-0"
            onClick={() => lockLayerRef.current?.toggle()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLocked(false);
              }}
              aria-label="Unlock controls"
              className={cn(
                'absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-opacity duration-300 hover:bg-black/70',
                'opacity-100 transition-opacity duration-300',
                'group-data-[controls-visible=false]/touch:opacity-0'
              )}
            >
              <Lock className="h-4 w-4" />
            </button>
          </div>
        </TouchInactivityLayer>
      ) : (
        <TouchInactivityLayer
          ref={touchLayerRef}
          disableAutoHide={!engine.isPlaying}
          className="group/touch absolute inset-0"
        >
          <DoubleTapSeekZones
            currentTimeRef={engine.currentTimeRef}
            seek={engine.seek}
            onToggleControls={() => touchLayerRef.current?.toggle()}
            onCenterSingleTap={() => {
              engine.togglePlay();
              touchLayerRef.current?.reveal();
            }}
          />

          <Overlay
            isPaused={!engine.isPlaying}
            isBuffering={isBuffering}
            error={overlayError}
            onTogglePlay={engine.togglePlay}
            onRetry={handleRetry}
          />

          <TopControls
            className={cn(
              'absolute inset-x-0 top-0 px-2 pt-2 pb-4',
              'opacity-100 transition-opacity duration-300',
              'group-data-[controls-visible=false]/touch:opacity-0'
            )}
            isSettingsOpen={isSettingsOpen}
            onToggleSettings={() => setIsSettingsOpen((open) => !open)}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />

          <SettingsMenu
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            playbackRate={engine.playbackRate}
            onPlaybackRateChange={engine.setPlaybackRate}
            captionTracks={video.captions}
            activeCaptionLanguage={activeLanguage}
            onSelectCaptionLanguage={setActiveLanguage}
            onLock={() => setIsLocked(true)}
          />

          {isEnded && upNextSlot ? (
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-surface/90 via-surface/60 to-transparent pt-10 pb-2">
              {upNextSlot}
            </div>
          ) : (
            <div
              className={cn(
                'absolute inset-x-0 bottom-0 flex flex-col gap-0.5 pt-6 pb-1.5',
                'opacity-100 transition-opacity duration-300',
                'group-data-[controls-visible=false]/touch:opacity-0'
              )}
            >
              <ControlGroup
                className="px-2"
                isPlaying={engine.isPlaying}
                isMuted={engine.isMuted}
                volume={engine.volume}
                duration={engine.duration}
                subscribeToTime={engine.subscribeToTime}
                togglePlay={engine.togglePlay}
                toggleMute={engine.toggleMute}
                setVolume={engine.setVolume}
              />
              <ProgressBar
                className="px-2"
                duration={engine.duration}
                subscribeToTime={engine.subscribeToTime}
                bufferedRangesRef={engine.bufferedRangesRef}
                onSeek={engine.seek}
              />
            </div>
          )}
        </TouchInactivityLayer>
      )}
    </div>
  );
};

export default VideoPlayer;
