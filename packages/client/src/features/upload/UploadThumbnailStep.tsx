import { ArrowRight, SkipForward } from 'lucide-react';
import ThumbnailPicker from './ThumbnailPicker';

interface UploadThumbnailStepProps {
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  onContinue: () => void;
}

const UploadThumbnailStep = ({
  value,
  onChange,
  onContinue,
}: UploadThumbnailStepProps) => {
  return (
    <div className="flex flex-col items-center text-center w-full max-w-md mx-auto">
      <h2 className="text-lg font-semibold font-display text-text-primary">
        Pick a thumbnail
      </h2>
      <p className="mt-1 mb-6 text-xs text-text-muted max-w-xs">
        Upload a custom thumbnail, or skip it — we'll grab a frame from your
        video automatically.
      </p>

      <ThumbnailPicker value={value} onChange={onChange} />

      <div className="mt-7 flex items-center gap-3">
        {!value && (
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
            Skip for now
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          disabled={!value}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UploadThumbnailStep;
