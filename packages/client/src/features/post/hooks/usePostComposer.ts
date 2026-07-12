import { useCallback, useState } from 'react';
import { type ICreatorEvent, type PostVisibility } from '@network/shared';
import { useCreatePostMutation } from '../postApi';

export type PostAttachment = { kind: 'none' } | { kind: 'image'; file: File };

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
  const [attachment, setAttachment] = useState<PostAttachment>({
    kind: 'none',
  });
  const [error, setError] = useState<string | null>(null);

  const canSubmit = text.trim().length > 0 || attachment.kind !== 'none';

  const resetCompose = useCallback(() => {
    setText('');
    setTags([]);
    setVisibility('public');
    setAttachment({ kind: 'none' });
    setError(null);
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
    if (attachment.kind === 'image') {
      formData.append('image', attachment.file);
    }

    try {
      const result = await createPost(formData).unwrap();
      onPublished?.(result.data.creatorEvent);
      resetCompose();
    } catch {
      setError("Couldn't create the post. Please try again.");
    }
  }, [
    attachment,
    canSubmit,
    createPost,
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
    attachment,
    setAttachment,
    canSubmit,
    submit,
    error,
    isSubmitting: createPostState.isLoading,
  };
};
