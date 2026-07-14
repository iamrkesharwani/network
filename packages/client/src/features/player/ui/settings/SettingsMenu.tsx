import { useEffect, useState } from 'react';
import type { ICaptionTrack } from '@network/shared';
import { cn } from '../../../../shared/utils/cn';
import SpeedPanel from './SpeedPanel';
import CaptionsPanel from './CaptionsPanel';
import RootPanel from './RootPanel';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  captionTracks?: ICaptionTrack[];
  activeCaptionLanguage?: string | 'off';
  onSelectCaptionLanguage?: (language: string | 'off') => void;
  className?: string;
}

export type SettingsView = 'root' | 'speed' | 'captions';

export function rateLabel(rate: number): string {
  return rate === 1 ? 'Normal' : `${rate}x`;
}

const SettingsMenu = ({
  isOpen,
  onClose,
  playbackRate,
  onPlaybackRateChange,
  captionTracks,
  activeCaptionLanguage,
  onSelectCaptionLanguage,
  className,
}: SettingsMenuProps) => {
  const [view, setView] = useState<SettingsView>('root');

  useEffect(() => {
    if (isOpen) setView('root');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasCaptions = Boolean(
    captionTracks && captionTracks.length > 0 && onSelectCaptionLanguage
  );

  return (
    <div
      className={cn(
        'absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4',
        className
      )}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Player settings"
        onClick={(event) => event.stopPropagation()}
        className="max-w-[calc(100%-1rem)] rounded-xl bg-black/90 py-1 text-white shadow-xl"
      >
        {view === 'root' && (
          <RootPanel
            playbackRate={playbackRate}
            hasCaptions={hasCaptions}
            onNavigate={setView}
            onClose={onClose}
          />
        )}

        {view === 'speed' && (
          <SpeedPanel
            playbackRate={playbackRate}
            onPlaybackRateChange={onPlaybackRateChange}
            onBack={() => setView('root')}
            onClose={onClose}
          />
        )}

        {view === 'captions' && captionTracks && onSelectCaptionLanguage && (
          <CaptionsPanel
            captionTracks={captionTracks}
            activeCaptionLanguage={activeCaptionLanguage}
            onSelectCaptionLanguage={onSelectCaptionLanguage}
            onBack={() => setView('root')}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default SettingsMenu;
