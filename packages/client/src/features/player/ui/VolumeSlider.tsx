import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { PLAYER_VOLUME_STEP, PLAYER_VOLUME_STORAGE_KEY } from '@network/shared';
import { cn } from '../../../shared/utils/cn';

interface VolumeSliderProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

function clampVolume(volume: number): number {
  return Math.max(0, Math.min(1, volume));
}

function volumeFromClientX(clientX: number, trackRect: DOMRect): number {
  const ratio = (clientX - trackRect.left) / trackRect.width;
  return clampVolume(ratio);
}

const VolumeSlider = ({
  volume,
  isMuted,
  onVolumeChange,
  className,
}: VolumeSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const onVolumeChangeRef = useRef(onVolumeChange);
  onVolumeChangeRef.current = onVolumeChange;

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(PLAYER_VOLUME_STORAGE_KEY);
    const parsed = stored !== null ? Number(stored) : NaN;
    if (Number.isFinite(parsed) && parsed > 0 && parsed <= 1) {
      onVolumeChangeRef.current(parsed);
    }
  }, []);

  useEffect(() => {
    if (volume > 0) {
      localStorage.setItem(PLAYER_VOLUME_STORAGE_KEY, String(volume));
    }
  }, [volume]);

  const displayedVolume = isMuted ? 0 : volume;

  const seekToClientX = useCallback((clientX: number) => {
    const track = containerRef.current;
    if (!track) return;
    onVolumeChangeRef.current(
      volumeFromClientX(clientX, track.getBoundingClientRect())
    );
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => seekToClientX(event.clientX),
    [seekToClientX]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
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
      setIsDragging(true);
      seekToClientX(event.clientX);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [seekToClientX, handleMouseMove, handleMouseUp]
  );

  const handleTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      setIsDragging(true);
      const touch = event.touches[0];
      if (touch) seekToClientX(touch.clientX);
    },
    [seekToClientX]
  );

  const handleTouchMove = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      if (touch) seekToClientX(touch.clientX);
    },
    [seekToClientX]
  );

  const handleTouchEnd = useCallback(() => setIsDragging(false), []);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      let delta = 0;
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp')
        delta = PLAYER_VOLUME_STEP;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown')
        delta = -PLAYER_VOLUME_STEP;
      else return;

      event.preventDefault();
      onVolumeChangeRef.current(clampVolume(volume + delta));
    },
    [volume]
  );

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label="Volume"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(displayedVolume * 100)}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex min-h-6 w-full touch-none items-center px-1.5 select-none cursor-pointer',
        className
      )}
    >
      <div className="relative h-1 w-full rounded-full bg-white/25">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white"
          style={{ width: `${(displayedVolume * 100).toFixed(2)}%` }}
        />
        <div
          className={cn(
            '-translate-x-1/2 -translate-y-1/2 absolute top-1/2 h-3 w-3 rounded-full bg-white shadow transition-opacity',
            isDragging ? 'opacity-100' : 'opacity-90'
          )}
          style={{ left: `${(displayedVolume * 100).toFixed(2)}%` }}
        />
      </div>
    </div>
  );
};

export default VolumeSlider;
