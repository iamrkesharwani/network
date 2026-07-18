import { useCallback, useState } from 'react';
import type { z } from 'zod';
import {
  MAX_POST_IMAGES,
  createPostSchema,
  type CreatePostInput,
  type ICreatorEvent,
  type PostVisibility,
} from '@network/shared';
import { useCreatePostMutation } from '../postApi';
import { useMediaEditForm } from '../../upload/hooks/useMediaEditForm';

export type PostComposeFormValues = {
  text?: string;
  tags?: string[];
  visibility?: PostVisibility;
};

interface UsePostComposerOptions {
  onPublished?: (creatorEvent: ICreatorEvent | null) => void;
}

export const usePostComposer = ({
  onPublished,
}: UsePostComposerOptions = {}) => {
  const [createPost, createPostState] = useCreatePostMutation();
  const [images, setImages] = useState<File[]>([]);

  const {
    register,
    control,
    watch,
    trigger,
    formState: { errors },
    submitError,
    submit,
    reset,
  } = useMediaEditForm<PostComposeFormValues, CreatePostInput>({
    schema: createPostSchema as unknown as z.ZodType<
      CreatePostInput,
      PostComposeFormValues
    >,
    defaultValues: {
      text: '',
      tags: [],
      visibility: 'public' as PostVisibility,
    },
    completenessRules: [],
  });

  const text = watch('text') ?? '';
  const tags = watch('tags') ?? [];
  const visibility = watch('visibility') ?? ('public' as PostVisibility);

  const canSubmit = text.trim().length > 0 || images.length > 0;

  const resetCompose = useCallback(() => {
    reset({ text: '', tags: [], visibility: 'public' as PostVisibility });
    setImages([]);
  }, [reset]);

  const addImages = useCallback((files: File[]) => {
    setImages((current) => [...current, ...files].slice(0, MAX_POST_IMAGES));
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((current) => current.filter((_, i) => i !== index));
  }, []);

  const publish = submit(async (data) => {
    const formData = new FormData();
    if (data.text?.trim()) formData.append('text', data.text.trim());
    (data.tags ?? []).forEach((tag) => formData.append('tags', tag));
    formData.append('visibility', data.visibility ?? 'public');
    images.forEach((file) => formData.append('images', file));

    const result = await createPost(formData).unwrap();
    onPublished?.(result.data.creatorEvent);
    resetCompose();
  });

  return {
    register,
    control,
    errors,
    trigger,
    text,
    tags,
    visibility,
    images,
    addImages,
    removeImage,
    canSubmit,
    publish,
    submitError,
    isSubmitting: createPostState.isLoading,
  };
};
