import { RefreshCw } from 'lucide-react';

interface VideoErrorStateProps {
  onRetry?: () => void;
}

const VideoErrorState = ({ onRetry }: VideoErrorStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
    <div className="w-14 h-14 rounded-2xl bg-error-subtle flex items-center justify-center">
      <RefreshCw className="w-6 h-6 text-error" strokeWidth={1.5} />
    </div>
    <div className="flex flex-col gap-1">
      <p className="text-sm font-semibold text-text-primary">
        Failed to load videos
      </p>
      <p className="text-xs text-text-muted">
        Something went wrong on our end.
      </p>
    </div>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-surface-raised text-text-secondary hover:text-text-primary hover:bg-surface-overlay border border-border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
        Try again
      </button>
    )}
  </div>
);

export default VideoErrorState;
