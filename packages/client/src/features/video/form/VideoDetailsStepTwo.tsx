import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import type { VideoCategory } from '@network/shared';
import CategoryPicker from '../../upload/components/CategoryPicker';
import TagInput from '../../upload/components/TagInput';
import type { VideoDetailsFormValues } from './VideoDetailsWizard';

interface VideoDetailsStepTwoProps {
  control: Control<VideoDetailsFormValues>;
  errors: FieldErrors<VideoDetailsFormValues>;
  onBack: () => void;
  onContinue: () => void;
}

const VideoDetailsStepTwo = ({
  control,
  errors,
  onBack,
  onContinue,
}: VideoDetailsStepTwoProps) => (
  <div>
    <Controller
      control={control}
      name="category"
      render={({ field }) => (
        <CategoryPicker
          value={field.value as VideoCategory | undefined}
          onChange={field.onChange}
          error={errors.category?.message}
        />
      )}
    />

    <Controller
      control={control}
      name="tags"
      render={({ field }) => (
        <TagInput
          value={field.value ?? []}
          onChange={field.onChange}
          error={errors.tags?.message as string | undefined}
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
        onClick={onContinue}
        className="flex-[2] rounded-lg border border-primary py-3 text-sm font-semibold text-primary cursor-pointer"
      >
        Continue
      </button>
    </div>
  </div>
);

export default VideoDetailsStepTwo;
