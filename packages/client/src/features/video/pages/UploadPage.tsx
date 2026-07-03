import { useState } from 'react';
import type { WizardStep } from '../../../shared/upload/UploadSteps';
import type { IGamificationEvent, IVideoResponse } from '@network/shared';
import { useDeleteVideoMutation, useGetVideoByIdQuery } from '../videoApi';
import { useGamificationCelebration } from '../../gamification/hooks/useGamificationCelebration';
import AchievementPopup from '../../gamification/components/AchievementPopup';
import LevelUpModal from '../../gamification/components/LevelUpModal';
import { CheckCircle2, Loader2, X } from 'lucide-react';
import UploadStepper from '../../upload/components/UploadStepper';
import { AnimatePresence, motion } from 'framer-motion';
import VideoUploadForm from '../../upload/form/VideoUploadForm';
import UploadThumbnailStep from '../../upload/components/UploadThumbnailStep';
import VideoEditForm from '../../upload/form/VideoEditForm';
import LaunchStep from '../../upload/components/LaunchStep';
import ConfirmModal from '../../../shared/components/ConfirmModal';

const stepVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

const UploadPage = () => {
  const [step, setStep] = useState<WizardStep>('drop');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>();
  const [finalVideo, setFinalVideo] = useState<IVideoResponse | null>(null);
  const [finalGamification, setFinalGamification] =
    useState<IGamificationEvent | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);

  const {
    currentAchievement,
    levelUp,
    celebrate,
    dismissAchievement,
    dismissLevelUp,
  } = useGamificationCelebration();

  const [deleteVideo] = useDeleteVideoMutation();

  const shouldPoll = !!videoId && step !== 'launch' && step !== 'drop';
  const { data: videoData } = useGetVideoByIdQuery(videoId ?? '', {
    skip: !shouldPoll,
    pollingInterval: shouldPoll ? 5000 : 0,
  });
  const processingStatus = videoData?.data.status;
  const providerThumbnail = videoData?.data.thumbnailUrl;

  const handleUploaded = (
    newVideoId: string,
    gamification: IGamificationEvent
  ) => {
    setVideoId(newVideoId);
    celebrate(gamification);
    setStep('thumbnail');
  };

  const handleDetailsSuccess = (
    video: IVideoResponse,
    gamification?: IGamificationEvent
  ) => {
    setFinalVideo(video);
    if (gamification) {
      setFinalGamification(gamification);
      celebrate(gamification);
    }
    setStep('launch');
  };

  const resetWizard = () => {
    setStep('drop');
    setVideoId(null);
    setThumbnailUrl(undefined);
    setFinalVideo(null);
    setFinalGamification(null);
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

  return (
    <div className="relative mx-auto max-w-2xl pb-20">
      <AchievementPopup
        achievement={currentAchievement}
        onDismiss={dismissAchievement}
      />

      <LevelUpModal level={levelUp?.level ?? null} onDismiss={dismissLevelUp} />

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold font-display text-text-primary">
          Upload a video
        </h1>
        {step !== 'drop' && step !== 'launch' && (
          <button
            type="button"
            onClick={() => setShowLeaveConfirm(true)}
            className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-error transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Start over
          </button>
        )}
      </div>

      {(step === 'thumbnail' || step === 'details') && processingStatus && (
        <div className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          {processingStatus === 'READY' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              Your video has finished processing
            </>
          ) : (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing your video in the background…
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
            {step === 'drop' && <VideoUploadForm onUploaded={handleUploaded} />}

            {step === 'thumbnail' && videoId && (
              <UploadThumbnailStep
                value={thumbnailUrl}
                onChange={setThumbnailUrl}
                onContinue={() => setStep('details')}
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
              <LaunchStep
                video={finalVideo}
                gamification={finalGamification}
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

export default UploadPage;
