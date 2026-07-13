import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { PLAYER_PLAYBACK_RATES } from '@network/shared';
import { cn } from '../../../shared/utils/cn';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  className?: string;
}

const SettingsMenu = ({
  isOpen,
  onClose,
  playbackRate,
  onPlaybackRateChange,
  className,
}: SettingsMenuProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="menu"
      aria-label="Playback settings"
      className={cn(
        'absolute bottom-full right-0 mb-2 min-w-40 rounded-lg bg-black/90 py-2 text-sm text-white shadow-lg',
        className
      )}
    >
      <div className="px-3 py-1 text-xs font-medium text-white/60">Playback speed</div>
      {PLAYER_PLAYBACK_RATES.map((rate) => (
        <button
          key={rate}
          type="button"
          role="menuitemradio"
          aria-checked={playbackRate === rate}
          onClick={() => {
            onPlaybackRateChange(rate);
            onClose();
          }}
          className="flex w-full items-center justify-between px-3 py-1.5 hover:bg-white/10"
        >
          <span>{rate === 1 ? 'Normal' : `${rate}x`}</span>
          {playbackRate === rate && <Check className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
};

export default SettingsMenu;
