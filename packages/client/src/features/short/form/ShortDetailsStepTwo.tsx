import { Controller, type Control } from 'react-hook-form';
import type { ShortVisibility } from '@network/shared';
import TagInput from '../../upload/components/TagInput';
import VisibilitySelector from '../../upload/components/VisibilitySelector';
import type { ShortDetailsFormValues } from './ShortDetailsWizard';

interface ShortDetailsStepTwoProps {
  control: Control<ShortDetailsFormValues>;
  errors: { tags?: { message?: string } };
  onBack: () => void;
  onReview: () => void;
}

const ShortDetailsStepTwo = ({
  control,
  errors,
  onBack,
  onReview,
}: ShortDetailsStepTwoProps) => (
  <div>
    <Controller
      control={control}
      name="tags"
      render={({ field }) => (
        <TagInput
          value={field.value ?? []}
          onChange={field.onChange}
          error={errors.tags?.message}
        />
      )}
    />

    <Controller
      control={control}
      name="visibility"
      render={({ field }) => (
        <VisibilitySelector
          value={(field.value as ShortVisibility) ?? 'public'}
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

export default ShortDetailsStepTwo;
