import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  POST_TEXT_MAX_LENGTH,
  ALLOWED_POST_IMAGE_MIME_TYPES,
  MAX_POST_IMAGE_SIZE_BYTES,
  MAX_POST_IMAGES,
} from '@network/shared';
import FloatingTextarea from '../../upload/components/FloatingTextarea';
import TagInput from '../../upload/components/TagInput';
import VisibilitySelector from '../../upload/components/VisibilitySelector';
import Button from '../../../shared/ui/primitives/Button';
import BadgeToast from '../../creator/components/BadgeToast';
import { useCreatorCelebration } from '../../creator/hooks/useCreatorCelebration';
import { useToast } from '../../../shared/hooks/useToast';
import { usePostComposer } from '../hooks/usePostComposer';

const ACCEPTED_ATTACHMENT_MIME = ALLOWED_POST_IMAGE_MIME_TYPES.join(',');

const validateImageFile = (file: File): string | null => {
  const isImage = ALLOWED_POST_IMAGE_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_POST_IMAGE_MIME_TYPES)[number]
  );

  if (!isImage) {
    return 'That file type is not supported. Please attach a JPEG, PNG, or WebP image.';
  }

  if (file.size > MAX_POST_IMAGE_SIZE_BYTES) {
    const maxMb = Math.floor(MAX_POST_IMAGE_SIZE_BYTES / (1024 * 1024));
    return `That image is too large. The max size is ${maxMb}MB.`;
  }

  return null;
};

const PostComposer = () => {
  const { addToast } = useToast();
  const { current: celebration, celebrate, dismiss } = useCreatorCelebration();
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
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
    isSubmitting,
  } = usePostComposer({
    onPublished: (creatorEvent) => {
      addToast('Your post is live', 'success');
      celebrate(creatorEvent);
    },
  });

  const previewUrls = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remainingSlots = MAX_POST_IMAGES - images.length;
      if (remainingSlots <= 0) {
        setAttachmentError(`You can attach up to ${MAX_POST_IMAGES} images.`);
        return;
      }

      const candidates = Array.from(files).slice(0, remainingSlots);
      for (const file of candidates) {
        const validationError = validateImageFile(file);
        if (validationError) {
          setAttachmentError(validationError);
          return;
        }
      }

      setAttachmentError(null);
      addImages(candidates);
    },
    [addImages, images.length]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  const canAddMore = images.length < MAX_POST_IMAGES;

  return (
    <div className="relative mx-auto max-w-2xl pb-20 pt-8 sm:pt-12 px-4">
      <BadgeToast item={celebration} onDismiss={dismiss} />

      <h1 className="text-xl font-bold font-display text-text-primary text-center mb-8">
        Create a post
      </h1>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
      >
        <FloatingTextarea
          label="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={POST_TEXT_MAX_LENGTH}
          counter={{ current: text.length, max: POST_TEXT_MAX_LENGTH }}
          rows={4}
          disabled={isSubmitting}
        />

        <div className="mb-6">
          <p className="text-sm font-medium text-text-secondary mb-2.5">
            Images{' '}
            <span className="text-text-muted font-normal">
              (optional, up to {MAX_POST_IMAGES})
            </span>
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_ATTACHMENT_MIME}
            multiple
            className="hidden"
            onChange={(e) => {
              handleFilesSelected(e.target.files);
              e.target.value = '';
            }}
          />

          {images.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-border bg-surface-raised py-10 flex flex-col items-center justify-center gap-2 text-text-muted hover:border-primary/40 hover:text-text-secondary transition-colors cursor-pointer"
            >
              <Plus className="w-6 h-6" strokeWidth={1.5} />
              <span className="text-sm">Add images</span>
              <span className="text-xs">JPEG, PNG, WebP</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {previewUrls.map((url, index) => (
                <div
                  key={url}
                  className="relative aspect-square rounded-xl overflow-hidden border border-border bg-surface-raised"
                >
                  <img
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={isSubmitting}
                    aria-label="Remove image"
                    className="absolute top-1.5 right-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {canAddMore && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-border bg-surface-raised flex items-center justify-center text-text-muted hover:border-primary/40 hover:text-text-secondary transition-colors cursor-pointer"
                  aria-label="Add more images"
                >
                  <Plus className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
            </div>
          )}

          {attachmentError && (
            <p role="alert" className="mt-2 text-sm text-error">
              {attachmentError}
            </p>
          )}
        </div>

        <TagInput value={tags} onChange={setTags} />

        <VisibilitySelector value={visibility} onChange={setVisibility} />

        {error && (
          <p role="alert" className="mb-4 text-sm text-error">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          disabled={!canSubmit || isSubmitting}
        >
          Post
        </Button>
      </form>
    </div>
  );
};

export default PostComposer;
