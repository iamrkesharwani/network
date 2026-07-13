import { Controller, type Control } from 'react-hook-form';
import type { VideoVisibility } from '@network/shared';
import VisibilitySelector from '../../upload/components/VisibilitySelector';
import type { VideoDetailsFormValues } from './VideoDetailsWizard';

interface VideoDetailsStepThreeProps {
  control: Control<VideoDetailsFormValues>;
  onBack: () => void;
  onReview: () => void;
}

const VideoDetailsStepThree = ({
  control,
  onBack,
  onReview,
}: VideoDetailsStepThreeProps) => (
  <div>
    <Controller
      control={control}
      name="visibility"
      render={({ field }) => (
        <VisibilitySelector
          value={(field.value as VideoVisibility) ?? 'public'}
          onChange={field.onChange}
        />
      )}
    />

    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-text-secondary hover:border-primary/40 transition-colors cursor-pointer"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onReview}
        className="flex-[2] rounded-lg border border-primary py-3 text-sm font-semibold text-primary cursor-pointer"
      >
        Review
      </button>
    </div>
  </div>
);

export default VideoDetailsStepThree;
