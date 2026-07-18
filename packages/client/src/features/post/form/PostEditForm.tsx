import { Controller } from 'react-hook-form';
import { Loader2, Save } from 'lucide-react';
import type { z } from 'zod';
import {
  POST_TEXT_MAX_LENGTH,
  postUpdateSchema,
  type IPostResponse,
  type PostUpdateInput,
  type PostVisibility,
} from '@network/shared';
import { useUpdatePostMutation } from '../postApi';
import { useMediaEditForm } from '../../upload/hooks/useMediaEditForm';
import FloatingTextarea from '../../upload/components/FloatingTextarea';
import TagInput from '../../upload/components/TagInput';
import VisibilitySelector from '../../upload/components/VisibilitySelector';

type PostFormValues = {
  text?: string;
  tags?: string[];
  visibility?: PostVisibility;
};

interface PostEditFormProps {
  postId: string;
  initialValues: {
    text?: string;
    tags: string[];
    visibility: PostVisibility;
  };
  onSuccess: (post: IPostResponse) => void;
}

const PostEditForm = ({
  postId,
  initialValues,
  onSuccess,
}: PostEditFormProps) => {
  const [updatePost, { isLoading }] = useUpdatePostMutation();

  const {
    register,
    control,
    watch,
    formState: { errors },
    submitError,
    submit,
  } = useMediaEditForm<PostFormValues, PostUpdateInput>({
    schema: postUpdateSchema as unknown as z.ZodType<
      PostUpdateInput,
      PostFormValues
    >,
    defaultValues: {
      text: initialValues.text ?? '',
      tags: initialValues.tags,
      visibility: initialValues.visibility,
    },
    completenessRules: [],
  });

  const text = watch('text') ?? '';

  const onSubmit = submit(async (data) => {
    const result = await updatePost({ postId, ...data }).unwrap();
    onSuccess(result.data);
  });

  return (
    <form onSubmit={onSubmit} className="w-full max-w-lg mx-auto">
      <FloatingTextarea
        label="What's on your mind?"
        {...register('text')}
        maxLength={POST_TEXT_MAX_LENGTH}
        counter={{ current: text.length, max: POST_TEXT_MAX_LENGTH }}
        rows={4}
        error={errors.text?.message}
        disabled={isLoading}
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

      {submitError && (
        <p className="mb-3 text-sm text-red-500" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="submit-btn relative w-full overflow-hidden rounded-lg border border-primary py-3 text-sm font-semibold text-primary disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Save changes
      </button>
    </form>
  );
};

export default PostEditForm;
