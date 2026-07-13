import { useCallback, useRef } from 'react';
import type { IVideoResponse } from '@network/shared';
import { cn } from '../../../../shared/utils/cn';
import { useVideoSource } from '../../core/useVideoSource';
import { useMediaEngine } from '../../core/useMediaEngine';
import { useKeyboardShortcuts } from '../../core/useKeyboardShortcuts';
import ProgressBar from '../../ui/ProgressBar';
import ControlGroup from '../../ui/ControlGroup';
import Overlay from '../../ui/Overlay';
import TouchInactivityLayer, { type TouchInactivityLayerHandle } from '../../ui/TouchInactivityLayer';
import DoubleTapSeekZones from '../../ui/DoubleTapSeekZones';

interface VideoPlayerProps {
  video: IVideoResponse;
  className?: string;
}

const VideoPlayer = ({ video, className }: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchLayerRef = useRef<TouchInactivityLayerHandle>(null);

  const { state: sourceState, error: sourceError, retry } = useVideoSource(videoRef, video.playbackUrl);
  const engine = useMediaEngine(videoRef);

  const handleToggleFullscreen = useCallback(() => {}, []);

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
  });

  const isBuffering = sourceState === 'buffering' || engine.isBuffering;
  const overlayError = sourceError ?? engine.error;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={cn('group/player relative aspect-video w-full overflow-hidden rounded-lg bg-black', className)}
    >
      <video ref={videoRef} poster={video.thumbnailUrl} className="h-full w-full object-contain" playsInline />

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
          onRetry={retry}
        />

        <div
          className={cn(
            'absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/80 to-transparent px-3 pt-8 pb-2',
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
          />
        </div>
      </TouchInactivityLayer>
    </div>
  );
};

export default VideoPlayer;
