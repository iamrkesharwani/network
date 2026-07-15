import { Captions, Gauge, Lock } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';
import { rateLabel, type SettingsView } from './SettingsMenu';
import PanelHeader from './PanelHeader';

function RootPanel({
  playbackRate,
  hasCaptions,
  onNavigate,
  onClose,
  onLock,
}: {
  playbackRate: number;
  hasCaptions: boolean;
  onNavigate: (view: SettingsView) => void;
  onClose: () => void;
  onLock?: () => void;
}) {
  return (
    <div className="w-64 max-w-full px-1 py-1">
      <PanelHeader title="Settings" onClose={onClose} />

      <div className="flex flex-col py-1">
        <button
          type="button"
          onClick={() => onNavigate('speed')}
          className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-text-primary hover:bg-surface-raised"
        >
          <Gauge className="h-4 w-4 shrink-0 text-icon" />
          <span className="flex-1 text-left">Playback speed</span>
          <span className="text-text-secondary">{rateLabel(playbackRate)}</span>
        </button>

        <button
          type="button"
          onClick={() => hasCaptions && onNavigate('captions')}
          disabled={!hasCaptions}
          aria-disabled={!hasCaptions}
          className={cn(
            'flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-text-primary',
            hasCaptions
              ? 'hover:bg-surface-raised'
              : 'cursor-not-allowed text-text-muted'
          )}
        >
          <Captions
            className={cn(
              'h-4 w-4 shrink-0',
              hasCaptions ? 'text-icon' : 'text-text-muted'
            )}
          />
          <span className="flex-1 text-left">Captions</span>
          {!hasCaptions && (
            <span className="text-xs text-text-muted">Unavailable</span>
          )}
        </button>

        {onLock && (
          <button
            type="button"
            onClick={onLock}
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-text-primary hover:bg-surface-raised"
          >
            <Lock className="h-4 w-4 shrink-0 text-icon" />
            <span className="flex-1 text-left">Lock</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default RootPanel;
