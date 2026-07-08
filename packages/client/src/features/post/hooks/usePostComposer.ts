import { useCallback, useEffect, useRef, useState } from 'react';
import type { ICreatorEvent, PostVisibility } from '@network/shared';
import { useCreatePostMutation, useFinalisePostMutation } from '../postApi';
import { useRawPostVideoUpload } from './usePostVideoUpload';

export type PostAttachment =
  | { kind: 'none' }
  | { kind: 'image'; file: File }
  | { kind: 'video'; file: File };

interface UsePostComposerOptions {
  onPublished?: (creatorEvent: ICreatorEvent | null) => void;
}

export const usePostComposer = ({
  onPublished,
}: UsePostComposerOptions = {}) => {
  const [createPost, createPostState] = useCreatePostMutation();
  const [finalisePost] = useFinalisePostMutation();
  const videoUpload = useRawPostVideoUpload();

  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [attachment, setAttachment] = useState<PostAttachment>({
    kind: 'none',
  });
  const [error, setError] = useState<string | null>(null);

  const finalisedRef = useRef(false);

  const canSubmit = text.trim().length > 0 || attachment.kind !== 'none';

  const reset = useCallback(() => {
    setText('');
    setTags([]);
    setVisibility('public');
    setAttachment({ kind: 'none' });
    setError(null);
    finalisedRef.current = false;
    videoUpload.reset();
  }, [videoUpload]);

  const submit = useCallback(async () => {
    setError(null);

    if (!canSubmit) {
      setError('Write something or attach an image/video first.');
      return;
    }

    if (attachment.kind === 'video') {
      finalisedRef.current = false;
      await videoUpload.startUpload(attachment.file);
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
      reset();
    } catch {
      setError("Couldn't create the post. Please try again.");
    }
  }, [
    attachment,
    canSubmit,
    createPost,
    onPublished,
    reset,
    tags,
    text,
    visibility,
    videoUpload,
  ]);

  useEffect(() => {
    if (
      attachment.kind !== 'video' ||
      videoUpload.state.stage !== 'done' ||
      !videoUpload.state.videoId ||
      finalisedRef.current
    ) {
      return;
    }

    finalisedRef.current = true;

    finalisePost({
      postId: videoUpload.state.videoId,
      ...(text.trim() && { text: text.trim() }),
      tags,
      visibility,
    })
      .unwrap()
      .then((result) => {
        onPublished?.(result.data.creatorEvent);
        reset();
      })
      .catch(() => {
        setError(
          'Video uploaded, but finalising the post failed. Please retry.'
        );
      });
  }, [
    attachment.kind,
    videoUpload.state.stage,
    videoUpload.state.videoId,
    finalisePost,
    onPublished,
    reset,
    tags,
    text,
    visibility,
  ]);

  const isUploadingVideo =
    attachment.kind === 'video' &&
    videoUpload.state.stage !== 'idle' &&
    videoUpload.state.stage !== 'done' &&
    videoUpload.state.stage !== 'error' &&
    videoUpload.state.stage !== 'cancelled';

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
    reset,
    error,
    isSubmitting: createPostState.isLoading || isUploadingVideo,
    videoUploadState: videoUpload.state,
    cancelVideoUpload: videoUpload.cancelUpload,
  };
};
