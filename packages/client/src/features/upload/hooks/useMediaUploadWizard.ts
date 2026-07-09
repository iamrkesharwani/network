import { useEffect, useState } from 'react';
import type { WizardStep } from '../../../shared/upload/UploadSteps';
import type {
  ApiResponse,
  ICreatorEvent,
  IPersistedUploadPointer,
  MediaProcessingStatus,
  MultipartMediaType,
  UploadState,
} from '@network/shared';
import { useAppDispatch } from '../../../shared/hooks/useAppDispatch';
import { useAppSelector } from '../../../shared/hooks/useAppSelector';
import {
  resetWizardState,
  selectWizardState,
  setWizardState,
} from '../uploadSlice';
import { useCreatorCelebration } from '../../creator/hooks/useCreatorCelebration';
import { createThumbnailUploader } from './useMediaEditForm';
import {
  saveUploadPointer,
  loadUploadPointer,
  clearUploadPointer,
} from '../utils/uploadPersistence';

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
  mediaType: MultipartMediaType;
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
  const {
    mediaType,
    mediaLabel,
    upload,
    useGetByIdQuery,
    deleteMedia,
    uploadThumbnail,
  } = config;
  const {
    state: uploadState,
    startUpload,
    cancelUpload,
    reset: resetUpload,
  } = upload;

  const dispatch = useAppDispatch();
  const wizard = useAppSelector(selectWizardState(mediaType));
  const { step, mediaId, thumbnailUrl, finalMedia: finalMediaRaw } = wizard;
  const finalMedia = finalMediaRaw as TMediaResponse | null;

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const [isProcessingTerminal, setIsProcessingTerminal] = useState(false);
  const [resumePointer, setResumePointer] =
    useState<IPersistedUploadPointer | null>(null);

  const { current: celebration, celebrate, dismiss } = useCreatorCelebration();

  const handleThumbnailUpload = createThumbnailUploader(uploadThumbnail);

  const setStep = (nextStep: WizardStep) => {
    dispatch(setWizardState({ mediaType, patch: { step: nextStep } }));
  };

  const setThumbnailUrl = (url: string | undefined) => {
    dispatch(setWizardState({ mediaType, patch: { thumbnailUrl: url } }));
  };

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
    dispatch(
      setWizardState({
        mediaType,
        patch: {
          stage: uploadState.stage,
          progressPercent: uploadState.progressPercent,
          sessionId: uploadState.sessionId,
          fingerprint: uploadState.fingerprint,
          uploadedParts: uploadState.uploadedParts,
          totalParts: uploadState.totalParts,
        },
      })
    );
  }, [
    dispatch,
    mediaType,
    uploadState.stage,
    uploadState.progressPercent,
    uploadState.sessionId,
    uploadState.fingerprint,
    uploadState.uploadedParts,
    uploadState.totalParts,
  ]);

  useEffect(() => {
    if (uploadState.stage === 'done' && uploadState.videoId) {
      dispatch(
        setWizardState({
          mediaType,
          patch: { mediaId: uploadState.videoId, step: 'thumbnail' },
        })
      );
    }
  }, [dispatch, mediaType, uploadState.stage, uploadState.videoId]);

  useEffect(() => {
    if (wizard.sessionId || wizard.mediaId) return;

    const pointer = loadUploadPointer(mediaType);
    if (!pointer) return;

    const isFullyUploaded =
      pointer.totalParts > 0 &&
      pointer.uploadedParts.length >= pointer.totalParts;

    if (pointer.step !== 'drop' || isFullyUploaded) {
      dispatch(
        setWizardState({
          mediaType,
          patch: {
            step: (pointer.step === 'drop'
              ? 'thumbnail'
              : pointer.step) as WizardStep,
            mediaId: pointer.mediaId || null,
            sessionId: pointer.sessionId,
            fingerprint: pointer.fingerprint,
            uploadedParts: pointer.uploadedParts.map((part) => part.partNumber),
            totalParts: pointer.totalParts,
          },
        })
      );
      return;
    }

    setResumePointer(pointer);
  }, []);

  useEffect(() => {
    if (!uploadState.sessionId || !uploadState.storageKey) return;

    if (resumePointer) setResumePointer(null);

    const existing = loadUploadPointer(mediaType);

    saveUploadPointer({
      mediaType,
      sessionId: uploadState.sessionId,
      mediaId: uploadState.videoId ?? wizard.mediaId ?? existing?.mediaId ?? '',
      fingerprint: uploadState.fingerprint ?? existing?.fingerprint ?? '',
      storageKey: uploadState.storageKey,
      fileName: uploadState.file?.name ?? existing?.fileName ?? '',
      fileSizeBytes:
        uploadState.file?.size ??
        existing?.fileSizeBytes ??
        uploadState.totalBytes,
      uploadedParts: uploadState.uploadedParts.map((partNumber) => ({
        partNumber,
        etag: '',
      })),
      totalParts: uploadState.totalParts,
      step,
    });
  }, [
    mediaType,
    step,
    wizard.mediaId,
    resumePointer,
    uploadState.sessionId,
    uploadState.storageKey,
    uploadState.videoId,
    uploadState.fingerprint,
    uploadState.file,
    uploadState.totalBytes,
    uploadState.uploadedParts,
    uploadState.totalParts,
  ]);

  const handleDetailsSuccess = (
    media: TMediaResponse,
    creatorEvent?: ICreatorEvent | null
  ) => {
    dispatch(
      setWizardState({
        mediaType,
        patch: {
          finalMedia: media as unknown as Record<string, unknown>,
          step: 'launch',
        },
      })
    );
    celebrate(creatorEvent ?? null);
  };

  const resetWizard = () => {
    dispatch(resetWizardState({ mediaType }));
    setIsProcessingTerminal(false);
    resetUpload();
    clearUploadPointer(mediaType);
    setResumePointer(null);
  };

  const discardResume = () => {
    clearUploadPointer(mediaType);
    setResumePointer(null);
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
    resumePointer,
    discardResume,
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
