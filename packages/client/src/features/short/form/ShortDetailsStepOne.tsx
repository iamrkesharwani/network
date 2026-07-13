import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import FloatingInput from '../../upload/components/FloatingInput';
import FloatingTextarea from '../../upload/components/FloatingTextarea';
import type { ShortDetailsFormValues } from './ShortDetailsWizard';

interface ShortDetailsStepOneProps {
  register: UseFormRegister<ShortDetailsFormValues>;
  errors: FieldErrors<ShortDetailsFormValues>;
  title: string;
  description: string;
  onContinue: () => void;
}

const ShortDetailsStepOne = ({
  register,
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

    <FloatingTextarea
      label="Description (optional)"
      rows={3}
      {...register('description')}
      error={errors.description?.message}
      counter={{ current: description.length, max: 500 }}
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
