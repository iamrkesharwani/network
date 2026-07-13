import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react';
import { formatDuration, PLAYER_SEEK_STEP_SECONDS } from '@network/shared';
import { cn } from '../../../shared/utils/cn';
import type { BufferedRange } from '../core/useMediaEngine';

interface ProgressBarProps {
  duration: number;
  subscribeToTime: (callback: (time: number) => void) => () => void;
  bufferedRangesRef: RefObject<BufferedRange[]>;
  onSeek: (time: number) => void;
  className?: string;
}

function clampTime(time: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return Math.max(0, Math.min(time, duration));
}

function ratioOf(time: number, duration: number): number {
  return duration > 0 ? time / duration : 0;
}

function timeFromClientX(
  clientX: number,
  trackRect: DOMRect,
  duration: number
): number {
  const ratio = (clientX - trackRect.left) / trackRect.width;
  return clampTime(ratio * duration, duration);
}

function rangesEqual(a: BufferedRange[], b: BufferedRange[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (range, index) =>
      range.start === b[index].start && range.end === b[index].end
  );
}

const ProgressBar = ({
  duration,
  subscribeToTime,
  bufferedRangesRef,
  onSeek,
  className,
}: ProgressBarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bufferedContainerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const latestTimeRef = useRef(0);
  const lastPaintedBufferedRef = useRef<BufferedRange[]>([]);
  const isDraggingRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const paintPlayhead = useCallback(
    (time: number) => {
      const percent = `${(ratioOf(time, duration) * 100).toFixed(2)}%`;
      if (fillRef.current) fillRef.current.style.width = percent;
      if (thumbRef.current) thumbRef.current.style.left = percent;
      containerRef.current?.setAttribute(
        'aria-valuenow',
        String(Math.round(time))
      );
    },
    [duration]
  );

  const paintBuffered = useCallback(
    (ranges: BufferedRange[]) => {
      const container = bufferedContainerRef.current;
      if (!container) return;

      container.innerHTML = '';
      ranges.forEach((range) => {
        const segment = document.createElement('div');
        segment.className = 'absolute inset-y-0 rounded-full bg-white/40';
        segment.style.left = `${(ratioOf(range.start, duration) * 100).toFixed(2)}%`;
        segment.style.width = `${(ratioOf(range.end - range.start, duration) * 100).toFixed(2)}%`;
        container.appendChild(segment);
      });
    },
    [duration]
  );

  useEffect(() => {
    return subscribeToTime((time) => {
      latestTimeRef.current = time;
    });
  }, [subscribeToTime]);

  useEffect(() => {
    let frameId: number;

    const tick = () => {
      if (!isDraggingRef.current) paintPlayhead(latestTimeRef.current);

      const currentBuffered = bufferedRangesRef.current;
      if (!rangesEqual(currentBuffered, lastPaintedBufferedRef.current)) {
        paintBuffered(currentBuffered);
        lastPaintedBufferedRef.current = currentBuffered;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [paintPlayhead, paintBuffered, bufferedRangesRef]);

  const seekToClientX = useCallback(
    (clientX: number) => {
      const track = containerRef.current;
      if (!track) return;
      const time = timeFromClientX(
        clientX,
        track.getBoundingClientRect(),
        duration
      );
      latestTimeRef.current = time;
      paintPlayhead(time);
      onSeek(time);
    },
    [duration, onSeek, paintPlayhead]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      seekToClientX(event.clientX);
    },
    [seekToClientX]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
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
      isDraggingRef.current = true;
      setIsDragging(true);
      seekToClientX(event.clientX);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [seekToClientX, handleMouseMove, handleMouseUp]
  );

  const handleTrackMouseMove = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (isDraggingRef.current) return;
      const track = containerRef.current;
      if (!track) return;
      setHoverTime(
        timeFromClientX(event.clientX, track.getBoundingClientRect(), duration)
      );
    },
    [duration]
  );

  const handleTrackMouseLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  const handleTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      isDraggingRef.current = true;
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

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      let nextTime: number | null = null;
      if (event.key === 'ArrowLeft') nextTime = latestTimeRef.current - PLAYER_SEEK_STEP_SECONDS;
      else if (event.key === 'ArrowRight')
        nextTime = latestTimeRef.current + PLAYER_SEEK_STEP_SECONDS;
      else if (event.key === 'Home') nextTime = 0;
      else if (event.key === 'End') nextTime = duration;

      if (nextTime === null) return;
      event.preventDefault();
      const clamped = clampTime(nextTime, duration);
      latestTimeRef.current = clamped;
      paintPlayhead(clamped);
      onSeek(clamped);
    },
    [duration, onSeek, paintPlayhead]
  );

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleTrackMouseMove}
      onMouseLeave={handleTrackMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative flex min-h-11 w-full touch-none items-center select-none cursor-pointer',
        className
      )}
    >
      <div className="relative h-1 w-full rounded-full bg-white/25">
        <div
          ref={bufferedContainerRef}
          className="absolute inset-0 overflow-hidden rounded-full"
        />
        <div
          ref={fillRef}
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          style={{ width: '0%' }}
        />
        <div
          ref={thumbRef}
          className={cn(
            '-translate-x-1/2 -translate-y-1/2 absolute top-1/2 h-3 w-3 rounded-full bg-primary shadow transition-opacity opacity-0 group-hover:opacity-100',
            isDragging && 'opacity-100'
          )}
          style={{ left: '0%' }}
        />
      </div>

      {hoverTime !== null && !isDragging && (
        <div
          className="pointer-events-none absolute bottom-full mb-2 hidden -translate-x-1/2 rounded-md bg-black/80 px-2 py-1 text-xs text-white pointer-fine:block"
          style={{
            left: `${(ratioOf(hoverTime, duration) * 100).toFixed(2)}%`,
          }}
        >
          {formatDuration(hoverTime)}
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
