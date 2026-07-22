import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { POST_TEXT_MAX_LENGTH } from '@network/shared';
import FloatingMentionTextarea from '../../upload/components/FloatingMentionTextarea';
import type { PostComposeFormValues } from '../hooks/usePostComposer';

interface PostStepOneProps {
  control: Control<PostComposeFormValues>;
  errors: FieldErrors<PostComposeFormValues>;
  text: string;
  onContinue: () => void;
  disabled: boolean;
}

const PostStepOne = ({
  control,
  errors,
  text,
  onContinue,
  disabled,
}: PostStepOneProps) => (
  <div>
    <Controller
      control={control}
      name="text"
      render={({ field }) => (
        <FloatingMentionTextarea
          label="What's on your mind?"
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          maxLength={POST_TEXT_MAX_LENGTH}
          counter={{ current: text.length, max: POST_TEXT_MAX_LENGTH }}
          rows={6}
          error={errors.text?.message}
          disabled={disabled}
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

export default PostStepOne;
