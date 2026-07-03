import { useState, useEffect } from 'react';
import type { WizardStep } from '../../../shared/upload/UploadSteps';
import type { IShortResponse } from '@network/shared';
import {
  useDeleteShortMutation,
  useGetShortByIdQuery,
  useUploadThumbnailMutation,
} from '../shortApi';
import { useRawShortUpload } from '../hooks/useShortUpload';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import UploadStepper from '../../upload/UploadStepper';
import { AnimatePresence, motion } from 'framer-motion';
import MediaDropzone from '../../upload/MediaDropzone';
import UploadThumbnailStep from '../../upload/UploadThumbnailStep';
import ShortEditForm from './ShortEditForm';
import SuccessStep from '../../upload/SuccessStep';
import ConfirmModal from '../../../shared/components/ConfirmModal';

const stepVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

const ShortUploadWizard = () => {
  const [step, setStep] = useState<WizardStep>('drop');
  const [shortId, setShortId] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>();
  const [finalShort, setFinalShort] = useState<IShortResponse | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);

  const [deleteShort] = useDeleteShortMutation();
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
  } = useRawShortUpload();

  const shouldPoll = !!shortId && step !== 'launch' && step !== 'drop';
  const { data: shortData } = useGetShortByIdQuery(shortId ?? '', {
    skip: !shouldPoll,
    pollingInterval: shouldPoll ? 5000 : 0,
  });
  const processingStatus = shortData?.data.status;
  const providerThumbnail = shortData?.data.thumbnailUrl;

  useEffect(() => {
    if (uploadState.stage === 'done' && uploadState.videoId) {
      setShortId(uploadState.videoId);
      setStep('thumbnail');
    }
  }, [uploadState.stage, uploadState.videoId]);

  const handleDetailsSuccess = (short: IShortResponse) => {
    setFinalShort(short);
    setStep('launch');
  };

  const resetWizard = () => {
    setStep('drop');
    setShortId(null);
    setThumbnailUrl(undefined);
    setFinalShort(null);
    resetUpload();
  };

  const handleAbandon = async () => {
    setIsAbandoning(true);
    if (shortId) {
      try {
        await deleteShort(shortId).unwrap();
      } catch {}
    }
    setIsAbandoning(false);
    setShowLeaveConfirm(false);
    resetWizard();
  };

  return (
    <div className="relative mx-auto max-w-2xl pb-20 pt-8 sm:pt-12 px-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold font-display text-text-primary">
          Upload a short
        </h1>
        {step !== 'drop' && step !== 'launch' && (
          <button
            type="button"
            onClick={() => setShowLeaveConfirm(true)}
            className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-error transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Cancel & discard
          </button>
        )}
      </div>

      {(step === 'thumbnail' || step === 'details') && processingStatus && (
        <div className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          {processingStatus === 'READY' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              Your short has finished processing
            </>
          ) : (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing your short in the background…
            </>
          )}
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
                title="Drag & drop your short"
                subtitle="or click to browse · MP4, MOV, WebM, MKV · vertical, up to 60s"
                accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
              />
            )}

            {step === 'thumbnail' && shortId && (
              <UploadThumbnailStep
                value={thumbnailUrl}
                onChange={setThumbnailUrl}
                onContinue={() => setStep('details')}
                uploadThumbnail={handleThumbnailUpload}
              />
            )}

            {step === 'details' && shortId && (
              <ShortEditForm
                mode="finalise"
                shortId={shortId}
                thumbnailUrl={thumbnailUrl}
                onSuccess={handleDetailsSuccess}
              />
            )}

            {step === 'launch' && finalShort && (
              <SuccessStep
                title={finalShort.title}
                visibility={finalShort.visibility}
                viewUrl={`/short/${finalShort.id}`}
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
        description="This will delete the short you just uploaded and reset the wizard. This can't be undone."
        confirmLabel="Discard"
        intent="danger"
        isLoading={isAbandoning}
      />
    </div>
  );
};

export default ShortUploadWizard;
