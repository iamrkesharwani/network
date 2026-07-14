import { useEffect, useRef, useState } from 'react';
import {
  Maximize,
  Minimize,
  RectangleHorizontal,
  Settings,
} from 'lucide-react';
import type { ICaptionTrack } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import SettingsMenu from './SettingsMenu';

interface TopControlsProps {
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  isTheaterMode?: boolean;
  onToggleTheaterMode?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  captionTracks?: ICaptionTrack[];
  activeCaptionLanguage?: string | 'off';
  onSelectCaptionLanguage?: (language: string | 'off') => void;
  className?: string;
}

const TopControls = ({
  playbackRate,
  setPlaybackRate,
  isTheaterMode,
  onToggleTheaterMode,
  isFullscreen,
  onToggleFullscreen,
  captionTracks,
  activeCaptionLanguage,
  onSelectCaptionLanguage,
  className,
}: TopControlsProps) => {
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
      className={cn('flex w-full items-center justify-end gap-1', className)}
    >
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
          captionTracks={captionTracks}
          activeCaptionLanguage={activeCaptionLanguage}
          onSelectCaptionLanguage={onSelectCaptionLanguage}
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
  );
};

export default TopControls;
