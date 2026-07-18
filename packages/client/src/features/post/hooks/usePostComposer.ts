import { useCallback, useState } from 'react';
import {
  MAX_POST_IMAGES,
  type ICreatorEvent,
  type PostVisibility,
} from '@network/shared';
import { useCreatePostMutation } from '../postApi';

interface UsePostComposerOptions {
  onPublished?: (creatorEvent: ICreatorEvent | null) => void;
}

export const usePostComposer = ({
  onPublished,
}: UsePostComposerOptions = {}) => {
  const [createPost, createPostState] = useCreatePostMutation();

  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = text.trim().length > 0 || images.length > 0;

  const resetCompose = useCallback(() => {
    setText('');
    setTags([]);
    setVisibility('public');
    setImages([]);
    setError(null);
  }, []);

  const addImages = useCallback((files: File[]) => {
    setImages((current) => [...current, ...files].slice(0, MAX_POST_IMAGES));
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((current) => current.filter((_, i) => i !== index));
  }, []);

  const submit = useCallback(async () => {
    setError(null);

    if (!canSubmit) {
      setError('Write something or attach an image first.');
      return;
    }

    const formData = new FormData();
    if (text.trim()) formData.append('text', text.trim());
    tags.forEach((tag) => formData.append('tags', tag));
    formData.append('visibility', visibility);
    images.forEach((file) => formData.append('images', file));

    try {
      const result = await createPost(formData).unwrap();
      onPublished?.(result.data.creatorEvent);
      resetCompose();
    } catch {
      setError("Couldn't create the post. Please try again.");
    }
  }, [
    canSubmit,
    createPost,
    images,
    onPublished,
    resetCompose,
    tags,
    text,
    visibility,
  ]);

  return {
    text,
    setText,
    tags,
    setTags,
    visibility,
    setVisibility,
    images,
    addImages,
    removeImage,
    canSubmit,
    submit,
    error,
    isSubmitting: createPostState.isLoading,
  };
};
