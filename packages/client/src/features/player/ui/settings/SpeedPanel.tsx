import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { PLAYER_PLAYBACK_RATES } from '@network/shared';
import PanelHeader from './PanelHeader';
import { cn } from '../../../../shared/utils/cn';
import { rateLabel } from './SettingsMenu';

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

export default SpeedPanel;
