import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ImageIcon, FileVideo, X } from 'lucide-react';
import {
  POST_TEXT_MAX_LENGTH,
  ALLOWED_POST_IMAGE_MIME_TYPES,
  ALLOWED_POST_VIDEO_MIME_TYPES,
  MAX_POST_IMAGE_SIZE_BYTES,
} from '@network/shared';
import FloatingTextarea from '../../upload/components/FloatingTextarea';
import MediaDropzone from '../../upload/components/MediaDropzone';
import TagInput from '../../upload/components/TagInput';
import VisibilitySelector from '../../upload/components/VisibilitySelector';
import Button from '../../../shared/ui/primitives/Button';
import BadgeToast from '../../creator/components/BadgeToast';
import { useCreatorCelebration } from '../../creator/hooks/useCreatorCelebration';
import { useToast } from '../../../shared/hooks/useToast';
import { usePostComposer } from '../hooks/usePostComposer';

const ACCEPTED_ATTACHMENT_MIME = [
  ...ALLOWED_POST_IMAGE_MIME_TYPES,
  ...ALLOWED_POST_VIDEO_MIME_TYPES,
].join(',');

const validateAttachment = (file: File): string | null => {
  const isImage = ALLOWED_POST_IMAGE_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_POST_IMAGE_MIME_TYPES)[number]
  );
  const isVideo = ALLOWED_POST_VIDEO_MIME_TYPES.includes(
    file.type as (typeof ALLOWED_POST_VIDEO_MIME_TYPES)[number]
  );

  if (!isImage && !isVideo) {
    return 'That file type is not supported. Please attach a JPEG, PNG, WebP image, or an MP4, MOV, WebM, MKV video.';
  }

  if (isImage && file.size > MAX_POST_IMAGE_SIZE_BYTES) {
    const maxMb = Math.floor(MAX_POST_IMAGE_SIZE_BYTES / (1024 * 1024));
    return `That image is too large. The max size is ${maxMb}MB.`;
  }

  return null;
};

const PostComposer = () => {
  const { addToast } = useToast();
  const { current: celebration, celebrate, dismiss } = useCreatorCelebration();
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const {
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
    isSubmitting,
    videoUploadState,
    cancelVideoUpload,
    resumePointer,
    discardResume,
    resumeVideoUpload,
  } = usePostComposer({
    onPublished: (creatorEvent) => {
      addToast('Your post is live', 'success');
      celebrate(creatorEvent);
    },
  });

  const previewUrl = useMemo(() => {
    if (attachment.kind === 'none') return null;
    return URL.createObjectURL(attachment.file);
  }, [attachment]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateAttachment(file);
      if (validationError) {
        setAttachmentError(validationError);
        return;
      }

      setAttachmentError(null);

      if (resumePointer) {
        resumeVideoUpload(file);
        return;
      }

      const isImage = ALLOWED_POST_IMAGE_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_POST_IMAGE_MIME_TYPES)[number]
      );

      setAttachment({ kind: isImage ? 'image' : 'video', file });
    },
    [setAttachment, resumePointer, resumeVideoUpload]
  );

  const handleRemoveAttachment = useCallback(() => {
    setAttachmentError(null);
    setAttachment({ kind: 'none' });
  }, [setAttachment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  const videoUploadStarted =
    attachment.kind === 'video' && videoUploadState.stage !== 'idle';

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
            Attachment{' '}
            <span className="text-text-muted font-normal">(optional)</span>
          </p>

          {attachment.kind === 'none' ? (
            <MediaDropzone
              state={{
                stage: 'idle',
                file: null,
                videoId: null,
                progressPercent: 0,
                uploadedBytes: 0,
                totalBytes: 0,
                speedBytesPerSec: 0,
                etaSeconds: null,
                error: attachmentError,
                sessionId: null,
                fingerprint: null,
                uploadedParts: [],
                totalParts: 0,
                storageKey: null,
              }}
              onFileSelect={handleFileSelect}
              onCancel={() => setAttachmentError(null)}
              title="Add an image or video"
              subtitle="or click to browse · JPEG, PNG, WebP, MP4, MOV, WebM, MKV"
              accept={ACCEPTED_ATTACHMENT_MIME}
              resumePointer={resumePointer}
              onDiscardResume={discardResume}
            />
          ) : videoUploadStarted ? (
            <MediaDropzone
              state={videoUploadState}
              onFileSelect={() => {}}
              onCancel={cancelVideoUpload}
            />
          ) : (
            <div className="relative rounded-2xl border border-border bg-surface-raised overflow-hidden">
              {attachment.kind === 'image' && previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Attachment preview"
                  className="w-full max-h-80 object-cover"
                />
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-muted shrink-0">
                    {attachment.kind === 'image' ? (
                      <ImageIcon className="w-5 h-5 text-primary" />
                    ) : (
                      <FileVideo className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-text-primary truncate">
                    {attachment.file.name}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleRemoveAttachment}
                disabled={isSubmitting}
                aria-label="Remove attachment"
                className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
