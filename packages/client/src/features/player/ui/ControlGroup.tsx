import { useEffect, useRef } from 'react';
import { Pause, Play, Volume1, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';
import VolumeSlider from './VolumeSlider';

interface ControlGroupProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  duration: number;
  subscribeToTime: (callback: (time: number) => void) => () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  className?: string;
}

function VolumeIcon({ isMuted, volume }: { isMuted: boolean; volume: number }) {
  if (isMuted || volume === 0) return <VolumeX className="h-5 w-5" />;
  if (volume < 0.5) return <Volume1 className="h-5 w-5" />;
  return <Volume2 className="h-5 w-5" />;
}

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

function TimeDisplay({
  duration,
  subscribeToTime,
}: {
  duration: number;
  subscribeToTime: (callback: (time: number) => void) => () => void;
}) {
  const currentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    return subscribeToTime((time) => {
      if (currentRef.current)
        currentRef.current.textContent = formatClock(time);
    });
  }, [subscribeToTime]);

  return (
    <span className="font-mono text-xs tabular-nums text-white select-none sm:text-sm">
      <span ref={currentRef}>{formatClock(0)}</span>
      <span className="mx-1 text-white/60">/</span>
      <span>{formatClock(duration)}</span>
    </span>
  );
}

const ControlGroup = ({
  isPlaying,
  isMuted,
  volume,
  duration,
  subscribeToTime,
  togglePlay,
  toggleMute,
  setVolume,
  className,
}: ControlGroupProps) => {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-2',
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
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

        <TimeDisplay duration={duration} subscribeToTime={subscribeToTime} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
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
          className="w-20"
        />
      </div>
    </div>
  );
};

export default ControlGroup;
