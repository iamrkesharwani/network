import { useState, useEffect } from 'react';
import type { WizardStep } from '../../../shared/upload/UploadSteps';
import type { ICreatorEvent, IVideoResponse } from '@network/shared';
import {
  useDeleteVideoMutation,
  useGetVideoByIdQuery,
  useUploadThumbnailMutation,
} from '../videoApi';
import { useRawUpload } from '../hooks/useVideoUpload';
import { useCreatorCelebration } from '../../creator/hooks/useCreatorCelebration';
import BadgeToast from '../../creator/components/BadgeToast';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import UploadStepper from '../../upload/UploadStepper';
import { AnimatePresence, motion } from 'framer-motion';
import MediaDropzone from '../../upload/MediaDropzone';
import UploadThumbnailStep from '../../upload/UploadThumbnailStep';
import VideoEditForm from './VideoEditForm';
import SuccessStep from '../../upload/SuccessStep';
import ConfirmModal from '../../../shared/components/ConfirmModal';

const stepVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

const VideoUploadWizard = () => {
  const [step, setStep] = useState<WizardStep>('drop');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>();
  const [finalVideo, setFinalVideo] = useState<IVideoResponse | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);

  const { current: celebration, celebrate, dismiss } = useCreatorCelebration();
  const [deleteVideo] = useDeleteVideoMutation();
  const [uploadThumbnail] = useUploadThumbnailMutation();

  const handleThumbnailUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    const result = await uploadThumbnail(formData).unwrap();
    return result.data.thumbnailUrl;
  };

  const {
    state: uploadState,
    startUpload,
    cancelUpload,
    reset: resetUpload,
  } = useRawUpload();

  const shouldPoll = !!videoId && step !== 'launch' && step !== 'drop';
  const { data: videoData } = useGetVideoByIdQuery(videoId ?? '', {
    skip: !shouldPoll,
    pollingInterval: shouldPoll ? 5000 : 0,
  });
  const processingStatus = videoData?.data.status;
  const providerThumbnail = videoData?.data.thumbnailUrl;

  useEffect(() => {
    if (uploadState.stage === 'done' && uploadState.videoId) {
      setVideoId(uploadState.videoId);
      setStep('thumbnail');
    }
  }, [uploadState.stage, uploadState.videoId]);

  const handleDetailsSuccess = (
    video: IVideoResponse,
    creatorEvent?: ICreatorEvent | null
  ) => {
    setFinalVideo(video);
    celebrate(creatorEvent ?? null);
    setStep('launch');
  };

  const resetWizard = () => {
    setStep('drop');
    setVideoId(null);
    setThumbnailUrl(undefined);
    setFinalVideo(null);
    resetUpload();
  };

  const handleAbandon = async () => {
    setIsAbandoning(true);
    if (videoId) {
      try {
        await deleteVideo(videoId).unwrap();
      } catch {}
    }
    setIsAbandoning(false);
    setShowLeaveConfirm(false);
    resetWizard();
  };

  const isUploadingStage =
    step === 'drop' &&
    ['validating', 'requesting', 'uploading', 'confirming'].includes(
      uploadState.stage
    );

  const isProcessing =
    (step === 'thumbnail' || step === 'details') &&
    !!processingStatus &&
    processingStatus !== 'READY';

  const isProcessingDone =
    (step === 'thumbnail' || step === 'details') &&
    processingStatus === 'READY';

  const statusLabel = isUploadingStage
    ? 'Uploading your video in the background…'
    : isProcessing
      ? 'Processing your video in the background…'
      : 'Your video has finished processing';

  const showStatusBar = isUploadingStage || isProcessing || isProcessingDone;

  return (
    <div className="relative mx-auto max-w-2xl pb-20 pt-8 sm:pt-12 px-4">
      <BadgeToast item={celebration} onDismiss={dismiss} />

      <h1 className="text-xl font-bold font-display text-text-primary text-center mb-2">
        Upload a video
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
              isUploadingStage ? cancelUpload() : setShowLeaveConfirm(true)
            }
            className="flex items-center gap-1 font-medium text-text-muted hover:text-error transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      )}

      <UploadStepper current={step} />

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 'drop' && (
              <MediaDropzone
                state={uploadState}
                onFileSelect={startUpload}
                onCancel={cancelUpload}
                title="Drag & drop your video"
                subtitle="or click to browse · MP4, MOV, WebM, MKV · up to 5GB"
                accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
              />
            )}

            {step === 'thumbnail' && videoId && (
              <UploadThumbnailStep
                value={thumbnailUrl}
                onChange={setThumbnailUrl}
                onContinue={() => setStep('details')}
                uploadThumbnail={handleThumbnailUpload}
              />
            )}

            {step === 'details' && videoId && (
              <VideoEditForm
                mode="finalise"
                videoId={videoId}
                thumbnailUrl={thumbnailUrl}
                onSuccess={handleDetailsSuccess}
              />
            )}

            {step === 'launch' && finalVideo && (
              <SuccessStep
                title={finalVideo.title}
                visibility={finalVideo.visibility}
                viewUrl={`/video/${finalVideo.id}`}
                onUploadAnother={resetWizard}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {step === 'thumbnail' && !thumbnailUrl && providerThumbnail && (
        <p className="mt-3 text-center text-[0.7rem] text-text-muted">
          A default thumbnail will be used once processing finishes.
        </p>
      )}

      <ConfirmModal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleAbandon}
        title="Discard this upload?"
        description="This will delete the video you just uploaded and reset the wizard. This can't be undone."
        confirmLabel="Discard"
        intent="danger"
        isLoading={isAbandoning}
      />
    </div>
  );
};

export default VideoUploadWizard;
