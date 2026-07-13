import { AlertCircle, Loader2, Play, RefreshCw } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

interface OverlayError {
  message: string;
}

interface OverlayProps {
  isPaused: boolean;
  isBuffering: boolean;
  error: OverlayError | null;
  onTogglePlay: () => void;
  onRetry: () => void;
  className?: string;
}

const Overlay = ({ isPaused, isBuffering, error, onTogglePlay, onRetry, className }: OverlayProps) => {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 flex items-center justify-center', className)}
    >
      {error ? (
        <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-lg bg-black/70 px-6 py-5 text-center text-white">
          <AlertCircle className="h-8 w-8 text-error" />
          <p className="max-w-64 text-sm">{error.message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium hover:bg-white/20"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : isBuffering ? (
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      ) : isPaused ? (
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label="Play"
          className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
        >
          <Play className="h-7 w-7 translate-x-0.5" />
        </button>
      ) : null}
    </div>
  );
};

export default Overlay;
