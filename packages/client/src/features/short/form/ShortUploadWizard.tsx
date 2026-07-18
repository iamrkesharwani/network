import { CLIENT_ROUTES, type IShortResponse } from '@network/shared';
import { useRawShortUpload } from '../hooks/useShortUpload';
import { useMediaUploadWizard } from '../../upload/hooks/useMediaUploadWizard';
import BadgeToast from '../../creator/components/BadgeToast';
import UploadHeaderSlot from '../../upload/components/UploadHeaderSlot';
import UploadStepper from '../../upload/components/UploadStepper';
import { ShortUploadSteps } from '../../upload/UploadSteps';
import { AnimatePresence, motion } from 'framer-motion';
import MediaDropzone from '../../upload/components/MediaDropzone';
import UploadThumbnailStep from '../../upload/components/UploadThumbnailStep';
import UploadConfirmation from '../../upload/components/UploadConfirmation';
import ConfirmModal from '../../../shared/ui/overlay/ConfirmModal';
import { SPRINGS } from '../../../shared/motion/springs';
import {
  useDeleteShortMutation,
  useGetShortByIdQuery,
  useUploadThumbnailMutation,
} from '../shortApi';
import ShortDetailsWizard, {
  type ShortDetailsStep,
} from './ShortDetailsWizard';

const stepVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

const stepGroup = (step: string) =>
  step === 'details-1' || step === 'details-2' ? 'details' : step;

const ShortUploadWizard = () => {
  const [deleteShort] = useDeleteShortMutation();
  const [uploadThumbnail] = useUploadThumbnailMutation();
  const upload = useRawShortUpload();

  const {
    step,
    setStep,
    mediaId: shortId,
    isFinalizeRoute,
    thumbnailUrl,
    setThumbnailUrl,
    showLeaveConfirm,
    setShowLeaveConfirm,
    isAbandoning,
    celebration,
    dismissCelebration,
    uploadState,
    startUpload,
    cancelUpload,
    handleThumbnailUpload,
    handleDetailsSuccess,
    handleAbandon,
    resumePointer,
    discardResume,
    continueResume,
    providerThumbnail,
    isUploadingStage,
    isProcessingDone,
    statusLabel,
    showStatusBar,
  } = useMediaUploadWizard<IShortResponse>({
    mediaType: 'short',
    mediaLabel: 'short',
    basePath: CLIENT_ROUTES.UPLOAD_SHORT,
    upload,
    useGetByIdQuery: useGetShortByIdQuery,
    deleteMedia: deleteShort,
    uploadThumbnail,
  });

  const displayStep = isFinalizeRoute ? step : 'drop';

  return (
    <div className="relative mx-auto max-w-2xl pb-20 pt-8 sm:pt-12 px-4">
      <BadgeToast item={celebration} onDismiss={dismissCelebration} />

      <UploadHeaderSlot
        title="Upload a short"
        showStatus={showStatusBar}
        isProcessingDone={isProcessingDone}
        statusLabel={statusLabel}
        onCancelClick={() =>
          isUploadingStage ? cancelUpload() : setShowLeaveConfirm(true)
        }
      />

      <UploadStepper
        current={displayStep}
        steps={ShortUploadSteps}
        isUploadStarted={!isFinalizeRoute && uploadState.stage !== 'idle'}
      />

      <motion.div
        layout
        transition={SPRINGS.smooth}
        className="rounded-2xl border border-border bg-surface p-6 sm:p-8 min-h-72"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={stepGroup(displayStep)}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {!isFinalizeRoute && (
              <MediaDropzone
                state={uploadState}
                onFileSelect={startUpload}
                onCancel={cancelUpload}
                title="Drag & drop your short"
                subtitle="or click to browse · MP4, MOV, WebM, MKV · vertical, up to 60s"
                accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
                resumePointer={resumePointer}
                onDiscardResume={discardResume}
                onContinueResume={continueResume}
              />
            )}

            {isFinalizeRoute && step === 'thumbnail' && shortId && (
              <UploadThumbnailStep
                value={thumbnailUrl}
                onChange={setThumbnailUrl}
                onContinue={() => setStep('details-1')}
                uploadThumbnail={handleThumbnailUpload!}
              />
            )}

            {isFinalizeRoute &&
              (step === 'details-1' || step === 'details-2') &&
              shortId && (
                <ShortDetailsWizard
                  shortId={shortId}
                  thumbnailUrl={thumbnailUrl}
                  step={step as ShortDetailsStep}
                  onStepChange={setStep}
                  onSuccess={handleDetailsSuccess}
                />
              )}

            {isFinalizeRoute && step === 'confirmation' && (
              <UploadConfirmation mediaLabel="short" profileTab="shorts" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {displayStep === 'thumbnail' && !thumbnailUrl && providerThumbnail && (
        <p className="mt-3 text-center text-[0.7rem] text-text-muted">
          A default thumbnail will be used once processing finishes.
        </p>
      )}

      <ConfirmModal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleAbandon}
        title="Discard this upload?"
        description="This will delete the short you just uploaded and reset the wizard. This can't be undone."
        confirmLabel="Discard"
        intent="danger"
        isLoading={isAbandoning}
      />
    </div>
  );
};

export default ShortUploadWizard;
