import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ImageIcon, Loader2, X } from 'lucide-react';
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
import UploadStepper from '../../upload/components/UploadStepper';
import SuccessStep from '../../upload/components/SuccessStep';
import { PostUploadSteps } from '../../upload/UploadSteps';
import Button from '../../../shared/ui/primitives/Button';
import BadgeToast from '../../creator/components/BadgeToast';
import { useToast } from '../../../shared/hooks/useToast';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import { usePostComposer } from '../hooks/usePostComposer';
import PostDetailsForm from './PostDetailsForm';

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
    startVideoAttachment,
    wizard,
  } = usePostComposer({
    onPublished: (creatorEvent) => {
      addToast('Your post is live', 'success');
      wizard.celebrate(creatorEvent);
    },
  });

  const {
    step,
    isFinalizeRoute,
    mediaId: postId,
    finalMedia: finalPost,
    uploadState: videoUploadState,
    cancelUpload: cancelVideoUpload,
    resumePointer,
    discardResume,
    handleDetailsSuccess,
    resetWizard,
    handleAbandon,
    showLeaveConfirm,
    setShowLeaveConfirm,
    isAbandoning,
    celebration,
    dismissCelebration,
    processingStatus,
    errorMessage,
    isUploadingStage,
    isProcessingDone,
    showStatusBar,
    statusLabel,
  } = wizard;

  const displayStep = isFinalizeRoute ? step : 'drop';

  const previewUrl = useMemo(() => {
    if (attachment.kind !== 'image') return null;
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

      const isImage = ALLOWED_POST_IMAGE_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_POST_IMAGE_MIME_TYPES)[number]
      );

      if (isImage) {
        setAttachment({ kind: 'image', file });
      } else {
        startVideoAttachment(file);
      }
    },
    [setAttachment, startVideoAttachment]
  );

  const handleRemoveAttachment = useCallback(() => {
    setAttachmentError(null);
    setAttachment({ kind: 'none' });
  }, [setAttachment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  const videoUploadActive = videoUploadState.stage !== 'idle';

  if (isFinalizeRoute) {
    return (
      <div className="relative mx-auto max-w-2xl pb-20 pt-8 sm:pt-12 px-4">
        <BadgeToast item={celebration} onDismiss={dismissCelebration} />

        <h1 className="text-xl font-bold font-display text-text-primary text-center mb-8">
          {displayStep === 'launch' ? 'Post published' : 'Add a caption'}
        </h1>

        {showStatusBar && (
          <div className="mb-6 flex items-center justify-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-2">
              {isProcessingDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              {statusLabel}
            </span>

            <button
              type="button"
              onClick={() =>
                isUploadingStage
                  ? cancelVideoUpload()
                  : setShowLeaveConfirm(true)
              }
              className="flex items-center gap-1 font-medium text-text-muted hover:text-error transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        )}

        <UploadStepper current={displayStep} steps={PostUploadSteps} />

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          {step === 'details' && postId && (
            <PostDetailsForm postId={postId} onSuccess={handleDetailsSuccess} />
          )}

          {step === 'launch' && finalPost && (
            <SuccessStep
              title={finalPost.text?.trim() || 'Your post'}
              visibility={finalPost.visibility}
              viewUrl={`/post/${finalPost.id}`}
              status={processingStatus ?? finalPost.status}
              errorMessage={errorMessage}
              onUploadAnother={resetWizard}
            />
          )}
        </div>

        <ConfirmModal
          isOpen={showLeaveConfirm}
          onClose={() => setShowLeaveConfirm(false)}
          onConfirm={handleAbandon}
          title="Discard this post?"
          description="This will delete the video you just uploaded and reset the composer. This can't be undone."
          confirmLabel="Discard"
          intent="danger"
          isLoading={isAbandoning}
        />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-2xl pb-20 pt-8 sm:pt-12 px-4">
      <BadgeToast item={celebration} onDismiss={dismissCelebration} />

      <h1 className="text-xl font-bold font-display text-text-primary text-center mb-8">
        Create a post
      </h1>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
      >
        {!videoUploadActive && (
          <FloatingTextarea
            label="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={POST_TEXT_MAX_LENGTH}
            counter={{ current: text.length, max: POST_TEXT_MAX_LENGTH }}
            rows={4}
            disabled={isSubmitting}
          />
        )}

        <div className={videoUploadActive ? undefined : 'mb-6'}>
          {!videoUploadActive && (
            <p className="text-sm font-medium text-text-secondary mb-2.5">
              Attachment{' '}
              <span className="text-text-muted font-normal">(optional)</span>
            </p>
          )}

          {attachment.kind === 'none' && !videoUploadActive ? (
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
          ) : videoUploadActive ? (
            <MediaDropzone
              state={videoUploadState}
              onFileSelect={() => {}}
              onCancel={cancelVideoUpload}
            />
          ) : (
            <div className="relative rounded-2xl border border-border bg-surface-raised overflow-hidden">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Attachment preview"
                  className="w-full max-h-80 object-cover"
                />
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-muted shrink-0">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-text-primary truncate">
                    {attachment.kind === 'image' && attachment.file.name}
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

        {!videoUploadActive && (
          <>
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
          </>
        )}
      </form>
    </div>
  );
};

export default PostComposer;
