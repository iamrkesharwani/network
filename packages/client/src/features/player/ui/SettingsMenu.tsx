import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Captions, Check, ChevronLeft, Gauge, X } from 'lucide-react';
import { PLAYER_PLAYBACK_RATES } from '@network/shared';
import type { ICaptionTrack } from '@network/shared';
import { cn } from '../../../shared/utils/cn';

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

type SettingsView = 'root' | 'speed' | 'captions';

function rateLabel(rate: number): string {
  return rate === 1 ? 'Normal' : `${rate}x`;
}

function nearestRateIndex(rate: number): number {
  let closestIndex = 0;
  let closestDistance = Infinity;
  PLAYER_PLAYBACK_RATES.forEach((candidate, index) => {
    const distance = Math.abs(candidate - rate);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  return closestIndex;
}

function PanelHeader({
  title,
  onBack,
  onClose,
}: {
  title: string;
  onBack?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="mb-1 flex items-center gap-1">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <span className="flex-1 truncate px-1 text-sm font-medium text-white">
        {title}
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close settings"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function SpeedPanel({
  playbackRate,
  onPlaybackRateChange,
  onBack,
  onClose,
}: {
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rates = PLAYER_PLAYBACK_RATES;
  const lastIndex = rates.length - 1;
  const activeIndex = nearestRateIndex(playbackRate);

  const indexFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return activeIndex;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      return Math.round(ratio * lastIndex);
    },
    [activeIndex, lastIndex]
  );

  const commitFromClientX = useCallback(
    (clientX: number) => {
      const index = indexFromClientX(clientX);
      const rate = rates[index];
      if (rate !== undefined && rate !== playbackRate) {
        onPlaybackRateChange(rate);
      }
    },
    [indexFromClientX, onPlaybackRateChange, playbackRate, rates]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => commitFromClientX(event.clientX),
    [commitFromClientX]
  );

  const handleMouseUp = useCallback(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      commitFromClientX(event.clientX);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [commitFromClientX, handleMouseMove, handleMouseUp]
  );

  const handleTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      if (touch) commitFromClientX(touch.clientX);
    },
    [commitFromClientX]
  );

  const handleTouchMove = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      if (touch) commitFromClientX(touch.clientX);
    },
    [commitFromClientX]
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const rate = rates[Math.max(0, activeIndex - 1)];
        if (rate !== undefined) onPlaybackRateChange(rate);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        const rate = rates[Math.min(lastIndex, activeIndex + 1)];
        if (rate !== undefined) onPlaybackRateChange(rate);
      }
    },
    [activeIndex, lastIndex, onPlaybackRateChange, rates]
  );

  const thumbPercent = (activeIndex / lastIndex) * 100;

  return (
    <div className="w-72 max-w-full px-1 py-1">
      <PanelHeader title="Playback speed" onBack={onBack} onClose={onClose} />

      <div className="flex flex-col items-center gap-5 px-3 pt-4 pb-2">
        <span className="font-mono text-2xl tabular-nums text-white">
          {rateLabel(rates[activeIndex] ?? playbackRate)}
        </span>

        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Playback speed"
          aria-valuemin={0}
          aria-valuemax={lastIndex}
          aria-valuenow={activeIndex}
          aria-valuetext={rateLabel(rates[activeIndex] ?? playbackRate)}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onKeyDown={handleKeyDown}
          className="relative flex h-8 w-full touch-none items-center px-1 select-none cursor-pointer"
        >
          <div className="relative h-1 w-full rounded-full bg-white/25">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: `${thumbPercent}%` }}
            />
            {rates.map((rate, index) => (
              <div
                key={rate}
                className={cn(
                  '-translate-x-1/2 -translate-y-1/2 absolute top-1/2 h-1.5 w-1.5 rounded-full',
                  index <= activeIndex ? 'bg-primary' : 'bg-white/40'
                )}
                style={{ left: `${(index / lastIndex) * 100}%` }}
              />
            ))}
            <div
              className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 h-3.5 w-3.5 rounded-full bg-primary shadow"
              style={{ left: `${thumbPercent}%` }}
            />
          </div>
        </div>

        <div className="flex w-full justify-between px-1 text-[11px] text-white/60 select-none">
          {rates.map((rate) => (
            <span key={rate}>{rateLabel(rate)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CaptionsPanel({
  captionTracks,
  activeCaptionLanguage,
  onSelectCaptionLanguage,
  onBack,
  onClose,
}: {
  captionTracks: ICaptionTrack[];
  activeCaptionLanguage?: string | 'off';
  onSelectCaptionLanguage: (language: string | 'off') => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const isCaptionsOff =
    activeCaptionLanguage === 'off' || activeCaptionLanguage === undefined;

  return (
    <div className="w-64 max-w-full px-1 py-1">
      <PanelHeader title="Captions" onBack={onBack} onClose={onClose} />

      <div className="flex flex-col py-1">
        <button
          type="button"
          role="menuitemradio"
          aria-checked={isCaptionsOff}
          onClick={() => {
            onSelectCaptionLanguage('off');
            onClose();
          }}
          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          <span>Off</span>
          {isCaptionsOff && <Check className="h-4 w-4" />}
        </button>
        {captionTracks.map((track) => (
          <button
            key={track.id}
            type="button"
            role="menuitemradio"
            aria-checked={activeCaptionLanguage === track.language}
            onClick={() => {
              onSelectCaptionLanguage(track.language);
              onClose();
            }}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-white hover:bg-white/10"
          >
            <span>{track.label}</span>
            {activeCaptionLanguage === track.language && (
              <Check className="h-4 w-4" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function RootPanel({
  playbackRate,
  hasCaptions,
  onNavigate,
  onClose,
}: {
  playbackRate: number;
  hasCaptions: boolean;
  onNavigate: (view: SettingsView) => void;
  onClose: () => void;
}) {
  return (
    <div className="w-64 max-w-full px-1 py-1">
      <PanelHeader title="Settings" onClose={onClose} />

      <div className="flex flex-col py-1">
        <button
          type="button"
          onClick={() => onNavigate('speed')}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white hover:bg-white/10"
        >
          <Gauge className="h-4 w-4 shrink-0 text-white/70" />
          <span className="flex-1 text-left">Playback speed</span>
          <span className="text-white/60">{rateLabel(playbackRate)}</span>
        </button>

        {hasCaptions && (
          <button
            type="button"
            onClick={() => onNavigate('captions')}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white hover:bg-white/10"
          >
            <Captions className="h-4 w-4 shrink-0 text-white/70" />
            <span className="flex-1 text-left">Captions</span>
          </button>
        )}
      </div>
    </div>
  );
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
