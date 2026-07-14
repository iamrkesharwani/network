import {
  Maximize,
  Minimize,
  RectangleHorizontal,
  Settings,
} from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

interface TopControlsProps {
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  isTheaterMode?: boolean;
  onToggleTheaterMode?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
}

const TopControls = ({
  isSettingsOpen,
  onToggleSettings,
  isTheaterMode,
  onToggleTheaterMode,
  isFullscreen,
  onToggleFullscreen,
  className,
}: TopControlsProps) => {
  return (
    <div
      className={cn('flex w-full items-center justify-end gap-1', className)}
    >
      <button
        type="button"
        onClick={onToggleSettings}
        aria-label="Settings"
        aria-haspopup="dialog"
        aria-expanded={isSettingsOpen}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
      >
        <Settings className="h-5 w-5" />
      </button>

      {onToggleTheaterMode && (
        <button
          type="button"
          onClick={onToggleTheaterMode}
          aria-label={isTheaterMode ? 'Exit theater mode' : 'Theater mode'}
          aria-pressed={isTheaterMode}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
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
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
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
