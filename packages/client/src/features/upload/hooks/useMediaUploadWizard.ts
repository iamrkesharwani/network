import { useEffect, useState } from 'react';
import type { WizardStep } from '../../../shared/upload/UploadSteps';
import type {
  ApiResponse,
  ICreatorEvent,
  MediaProcessingStatus,
  UploadState,
} from '@network/shared';
import { useCreatorCelebration } from '../../creator/hooks/useCreatorCelebration';
import { createThumbnailUploader } from './useMediaEditForm';

export interface BaseMediaResponse {
  id: string;
  title: string;
  visibility: string;
  status: MediaProcessingStatus;
  errorMessage?: string;
  thumbnailUrl?: string;
}

export interface UploadHookResult {
  state: UploadState;
  startUpload: (file: File) => void;
  cancelUpload: () => void;
  reset: () => void;
}

export interface MediaUploadWizardConfig<
  TMediaResponse extends BaseMediaResponse,
> {
  mediaLabel: string;
  upload: UploadHookResult;
  useGetByIdQuery: (
    id: string,
    options: { skip: boolean; pollingInterval: number }
  ) => { data?: ApiResponse<TMediaResponse> };
  deleteMedia: (id: string) => { unwrap: () => Promise<unknown> };
  uploadThumbnail: (formData: FormData) => {
    unwrap: () => Promise<{ data: { thumbnailUrl: string } }>;
  };
}

export const useMediaUploadWizard = <TMediaResponse extends BaseMediaResponse>(
  config: MediaUploadWizardConfig<TMediaResponse>
) => {
  const { mediaLabel, upload, useGetByIdQuery, deleteMedia, uploadThumbnail } =
    config;
  const {
    state: uploadState,
    startUpload,
    cancelUpload,
    reset: resetUpload,
  } = upload;

  const [step, setStep] = useState<WizardStep>('drop');
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>();
  const [finalMedia, setFinalMedia] = useState<TMediaResponse | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const [isProcessingTerminal, setIsProcessingTerminal] = useState(false);

  const { current: celebration, celebrate, dismiss } = useCreatorCelebration();

  const handleThumbnailUpload = createThumbnailUploader(uploadThumbnail);

  const shouldPoll = !!mediaId && step !== 'drop';
  const { data: mediaData } = useGetByIdQuery(mediaId ?? '', {
    skip: !shouldPoll,
    pollingInterval: shouldPoll && !isProcessingTerminal ? 5000 : 0,
  });
  const processingStatus = mediaData?.data.status;
  const providerThumbnail = mediaData?.data.thumbnailUrl;
  const errorMessage = mediaData?.data.errorMessage ?? finalMedia?.errorMessage;

  useEffect(() => {
    if (processingStatus === 'READY' || processingStatus === 'FAILED') {
      setIsProcessingTerminal(true);
    }
  }, [processingStatus]);

  useEffect(() => {
    if (uploadState.stage === 'done' && uploadState.videoId) {
      setMediaId(uploadState.videoId);
      setStep('thumbnail');
    }
  }, [uploadState.stage, uploadState.videoId]);

  const handleDetailsSuccess = (
    media: TMediaResponse,
    creatorEvent?: ICreatorEvent | null
  ) => {
    setFinalMedia(media);
    celebrate(creatorEvent ?? null);
    setStep('launch');
  };

  const resetWizard = () => {
    setStep('drop');
    setMediaId(null);
    setThumbnailUrl(undefined);
    setFinalMedia(null);
    setIsProcessingTerminal(false);
    resetUpload();
  };

  const handleAbandon = async () => {
    setIsAbandoning(true);
    if (mediaId) {
      try {
        await deleteMedia(mediaId).unwrap();
      } catch (error) {
        console.error('Failed to delete abandoned media:', error);
      }
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
    ? `Uploading your ${mediaLabel} in the background…`
    : isProcessing
      ? `Processing your ${mediaLabel} in the background…`
      : `Your ${mediaLabel} has finished processing`;

  const showStatusBar = isUploadingStage || isProcessing || isProcessingDone;

  return {
    step,
    setStep,
    mediaId,
    thumbnailUrl,
    setThumbnailUrl,
    finalMedia,
    showLeaveConfirm,
    setShowLeaveConfirm,
    isAbandoning,
    celebration,
    dismissCelebration: dismiss,
    uploadState,
    startUpload,
    cancelUpload,
    handleThumbnailUpload,
    handleDetailsSuccess,
    resetWizard,
    handleAbandon,
    processingStatus,
    providerThumbnail,
    errorMessage,
    isUploadingStage,
    isProcessing,
    isProcessingDone,
    statusLabel,
    showStatusBar,
  };
};
