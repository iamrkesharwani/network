import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import FloatingInput from '../../upload/components/FloatingInput';
import FloatingTextarea from '../../upload/components/FloatingTextarea';
import type { VideoDetailsFormValues } from './VideoDetailsWizard';

interface VideoDetailsStepOneProps {
  register: UseFormRegister<VideoDetailsFormValues>;
  errors: FieldErrors<VideoDetailsFormValues>;
  title: string;
  description: string;
  onContinue: () => void;
}

const VideoDetailsStepOne = ({
  register,
  errors,
  title,
  description,
  onContinue,
}: VideoDetailsStepOneProps) => (
  <div>
    <FloatingInput
      label="Title"
      {...register('title')}
      error={errors.title?.message}
      counter={{ current: title.length, max: 100 }}
    />

    <FloatingTextarea
      label="Description (optional)"
      rows={4}
      {...register('description')}
      error={errors.description?.message}
      counter={{ current: description.length, max: 5000 }}
      hint={
        description.length >= 50
          ? undefined
          : 'A description of 50+ characters helps viewers find your video'
      }
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

export default VideoDetailsStepOne;
