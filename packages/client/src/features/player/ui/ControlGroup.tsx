import { useEffect, useRef, useState } from 'react';
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RectangleHorizontal,
  Settings,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import VolumeSlider from './VolumeSlider';
import SettingsMenu from './SettingsMenu';

interface ControlGroupProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  playbackRate: number;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  isTheaterMode?: boolean;
  onToggleTheaterMode?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
}

function VolumeIcon({ isMuted, volume }: { isMuted: boolean; volume: number }) {
  if (isMuted || volume === 0) return <VolumeX className="h-5 w-5" />;
  if (volume < 0.5) return <Volume1 className="h-5 w-5" />;
  return <Volume2 className="h-5 w-5" />;
}

const ControlGroup = ({
  isPlaying,
  isMuted,
  volume,
  playbackRate,
  togglePlay,
  toggleMute,
  setVolume,
  setPlaybackRate,
  isTheaterMode,
  onToggleTheaterMode,
  isFullscreen,
  onToggleFullscreen,
  className,
}: ControlGroupProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSettingsOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!settingsContainerRef.current?.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isSettingsOpen]);

  return (
    <div
      className={cn(
        '@container flex w-full items-center justify-between gap-2',
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-1">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          <VolumeIcon isMuted={isMuted} volume={volume} />
        </button>

        <VolumeSlider
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={setVolume}
          className="ml-1 hidden w-20 @sm:flex"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <div
          ref={settingsContainerRef}
          className="relative flex shrink-0 items-center"
        >
          <button
            type="button"
            onClick={() => setIsSettingsOpen((open) => !open)}
            aria-label="Settings"
            aria-haspopup="menu"
            aria-expanded={isSettingsOpen}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
          >
            <Settings className="h-5 w-5" />
          </button>
          <SettingsMenu
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            playbackRate={playbackRate}
            onPlaybackRateChange={setPlaybackRate}
          />
        </div>

        {onToggleTheaterMode && (
          <button
            type="button"
            onClick={onToggleTheaterMode}
            aria-label={isTheaterMode ? 'Exit theater mode' : 'Theater mode'}
            aria-pressed={isTheaterMode}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
          >
            <RectangleHorizontal className="h-5 w-5" />
          </button>
        )}

        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            aria-pressed={isFullscreen}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ControlGroup;
