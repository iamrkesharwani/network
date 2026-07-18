import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { POST_TEXT_MAX_LENGTH } from '@network/shared';
import FloatingTextarea from '../../upload/components/FloatingTextarea';
import type { PostComposeFormValues } from '../hooks/usePostComposer';

interface PostStepOneProps {
  register: UseFormRegister<PostComposeFormValues>;
  errors: FieldErrors<PostComposeFormValues>;
  text: string;
  onContinue: () => void;
  disabled: boolean;
}

const PostStepOne = ({
  register,
  errors,
  text,
  onContinue,
  disabled,
}: PostStepOneProps) => (
  <div>
    <FloatingTextarea
      label="What's on your mind?"
      {...register('text')}
      maxLength={POST_TEXT_MAX_LENGTH}
      counter={{ current: text.length, max: POST_TEXT_MAX_LENGTH }}
      rows={6}
      error={errors.text?.message}
      disabled={disabled}
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
