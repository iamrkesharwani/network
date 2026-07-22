import { Controller, type Control, type UseFormRegister, type FieldErrors } from 'react-hook-form';
import FloatingInput from '../../upload/components/FloatingInput';
import FloatingMentionTextarea from '../../upload/components/FloatingMentionTextarea';
import type { ShortDetailsFormValues } from './ShortDetailsWizard';

interface ShortDetailsStepOneProps {
  register: UseFormRegister<ShortDetailsFormValues>;
  control: Control<ShortDetailsFormValues>;
  errors: FieldErrors<ShortDetailsFormValues>;
  title: string;
  description: string;
  onContinue: () => void;
}

const ShortDetailsStepOne = ({
  register,
  control,
  errors,
  title,
  description,
  onContinue,
}: ShortDetailsStepOneProps) => (
  <div>
    <FloatingInput
      label="Title"
      {...register('title')}
      error={errors.title?.message}
      counter={{ current: title.length, max: 100 }}
    />

    <Controller
      control={control}
      name="description"
      render={({ field }) => (
        <FloatingMentionTextarea
          label="Description (optional)"
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          rows={3}
          error={errors.description?.message}
          counter={{ current: description.length, max: 500 }}
        />
      )}
    />

    <button
      type="button"
      onClick={onContinue}
      className="submit-btn relative w-full overflow-hidden rounded-lg border border-primary py-3 text-sm font-semibold text-primary cursor-pointer"
    >
      Continue
    </button>
  </div>
);

export default ShortDetailsStepOne;
