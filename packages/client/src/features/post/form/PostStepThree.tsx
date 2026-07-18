import { Controller, type Control } from 'react-hook-form';
import type { PostVisibility } from '@network/shared';
import TagInput from '../../upload/components/TagInput';
import VisibilitySelector from '../../upload/components/VisibilitySelector';
import type { PostComposeFormValues } from '../hooks/usePostComposer';

interface PostStepThreeProps {
  control: Control<PostComposeFormValues>;
  errors: { tags?: { message?: string } };
  onBack: () => void;
  onReview: () => void;
}

const PostStepThree = ({
  control,
  errors,
  onBack,
  onReview,
}: PostStepThreeProps) => (
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
          value={(field.value as PostVisibility) ?? 'public'}
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
        className="flex-2 rounded-lg border border-primary py-3 text-sm font-semibold text-primary cursor-pointer"
      >
        Review
      </button>
    </div>
  </div>
);

export default PostStepThree;
