import { Check } from 'lucide-react';
import PanelHeader from './PanelHeader';
import type { ICaptionTrack } from '@network/shared';

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

export default CaptionsPanel;
