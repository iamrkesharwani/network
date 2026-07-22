import { Controller, type Control, type UseFormRegister, type FieldErrors } from 'react-hook-form';
import FloatingInput from '../../upload/components/FloatingInput';
import FloatingMentionTextarea from '../../upload/components/FloatingMentionTextarea';
import type { VideoDetailsFormValues } from './VideoDetailsWizard';

interface VideoDetailsStepOneProps {
  register: UseFormRegister<VideoDetailsFormValues>;
  control: Control<VideoDetailsFormValues>;
  errors: FieldErrors<VideoDetailsFormValues>;
  title: string;
  description: string;
  onContinue: () => void;
}

const VideoDetailsStepOne = ({
  register,
  control,
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

    <Controller
      control={control}
      name="description"
      render={({ field }) => (
        <FloatingMentionTextarea
          label="Description (optional)"
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          rows={4}
          error={errors.description?.message}
          counter={{ current: description.length, max: 5000 }}
          hint={
            description.length >= 50
              ? undefined
              : 'A description of 50+ characters helps viewers find your video'
          }
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

export default VideoDetailsStepOne;
