import { Captions, Gauge } from 'lucide-react';
import { cn } from '../../../../shared/utils/cn';
import { rateLabel, type SettingsView } from './SettingsMenu';
import PanelHeader from './PanelHeader';

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

        <button
          type="button"
          onClick={() => hasCaptions && onNavigate('captions')}
          disabled={!hasCaptions}
          aria-disabled={!hasCaptions}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-white',
            hasCaptions
              ? 'hover:bg-white/10'
              : 'cursor-not-allowed text-white/40'
          )}
        >
          <Captions
            className={cn(
              'h-4 w-4 shrink-0',
              hasCaptions ? 'text-white/70' : 'text-white/30'
            )}
          />
          <span className="flex-1 text-left">Captions</span>
          {!hasCaptions && (
            <span className="text-xs text-white/40">Unavailable</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default RootPanel;
