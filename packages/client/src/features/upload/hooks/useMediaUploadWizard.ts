import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { WizardStep } from '../UploadSteps';
import type {
  ApiResponse,
  ICreatorEvent,
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
import { useUploadResumePointer } from './useUploadResumePointer';

export interface BaseMediaResponse {
  id: string;
  title?: string;
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
  basePath: string;
  upload: UploadHookResult;
  useGetByIdQuery: (
    id: string,
    options: { skip: boolean; pollingInterval: number }
  ) => { data?: ApiResponse<TMediaResponse>; isError: boolean };
  deleteMedia: (id: string) => { unwrap: () => Promise<unknown> };
  uploadThumbnail?: (formData: FormData) => {
    unwrap: () => Promise<{ data: { thumbnailUrl: string } }>;
  };
  hasThumbnailStep?: boolean;
}

export const useMediaUploadWizard = <TMediaResponse extends BaseMediaResponse>(
  config: MediaUploadWizardConfig<TMediaResponse>
) => {
  const {
    mediaType,
    mediaLabel,
    basePath,
    upload,
    useGetByIdQuery,
    deleteMedia,
    uploadThumbnail,
    hasThumbnailStep = true,
  } = config;
  const {
    state: uploadState,
    startUpload,
    cancelUpload,
    reset: resetUpload,
  } = upload;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { mediaId: routeMediaId } = useParams<{ mediaId?: string }>();
  const isFinalizeRoute = !!routeMediaId;

  const wizard = useAppSelector(selectWizardState(mediaType));
  const { step, mediaId, thumbnailUrl, finalMedia: finalMediaRaw } = wizard;
  const finalMedia = finalMediaRaw as TMediaResponse | null;

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const [isProcessingTerminal, setIsProcessingTerminal] = useState(false);

  const { current: celebration, celebrate, dismiss } = useCreatorCelebration();

  const handleThumbnailUpload = uploadThumbnail
    ? createThumbnailUploader(uploadThumbnail)
    : undefined;

  const setStep = (nextStep: WizardStep) => {
    dispatch(setWizardState({ mediaType, patch: { step: nextStep } }));
  };

  const setThumbnailUrl = (url: string | undefined) => {
    dispatch(setWizardState({ mediaType, patch: { thumbnailUrl: url } }));
  };

  const effectiveMediaId = mediaId ?? routeMediaId ?? null;
  const shouldFetchMedia =
    !!effectiveMediaId && (isFinalizeRoute || step !== 'drop');
  const { data: mediaData, isError: mediaFetchError } = useGetByIdQuery(
    effectiveMediaId ?? '',
    {
      skip: !shouldFetchMedia,
      pollingInterval: shouldFetchMedia && !isProcessingTerminal ? 5000 : 0,
    }
  );
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
          patch: {
            mediaId: uploadState.videoId,
            step: hasThumbnailStep ? 'thumbnail' : 'details-1',
          },
        })
      );
      navigate(`${basePath}/finalize/${uploadState.videoId}`);
    }
  }, [
    dispatch,
    mediaType,
    uploadState.stage,
    uploadState.videoId,
    hasThumbnailStep,
    navigate,
    basePath,
  ]);

  // Recovers a finalize page that was reached directly (hard refresh, bookmark)
  // after the localStorage resume pointer has already been cleared. Fetchable
  // media doesn't prove finalization happened (a raw-upload placeholder is
  // fetchable long before finalize is ever called), so the safe default is
  // details-1, not the confirmation step.
  useEffect(() => {
    if (!isFinalizeRoute || !routeMediaId || mediaId === routeMediaId) return;

    if (mediaData) {
      dispatch(
        setWizardState({
          mediaType,
          patch: {
            mediaId: routeMediaId,
            step: 'details-1',
          },
        })
      );
    } else if (mediaFetchError) {
      navigate(basePath, { replace: true });
    }
  }, [
    isFinalizeRoute,
    routeMediaId,
    mediaId,
    mediaData,
    mediaFetchError,
    dispatch,
    mediaType,
    navigate,
    basePath,
  ]);

  const { resumePointer, discardResume, clearPointer, continueResume } =
    useUploadResumePointer({
      mediaType,
      uploadState,
      step,
      mediaId: wizard.mediaId,
      sessionId: wizard.sessionId,
      onRestorePointer: (pointer) => {
        dispatch(
          setWizardState({
            mediaType,
            patch: {
              step: (pointer.step === 'drop'
                ? hasThumbnailStep
                  ? 'thumbnail'
                  : 'details-1'
                : pointer.step) as WizardStep,
              mediaId: pointer.mediaId || null,
              sessionId: pointer.sessionId,
              fingerprint: pointer.fingerprint,
              uploadedParts: pointer.uploadedParts.map(
                (part) => part.partNumber
              ),
              totalParts: pointer.totalParts,
            },
          })
        );
        if (pointer.mediaId) {
          navigate(`${basePath}/finalize/${pointer.mediaId}`, {
            replace: true,
          });
        }
      },
    });

  const handleDetailsSuccess = (
    media: TMediaResponse,
    creatorEvent?: ICreatorEvent | null
  ) => {
    dispatch(
      setWizardState({
        mediaType,
        patch: {
          finalMedia: media as unknown as Record<string, unknown>,
          step: 'confirmation',
        },
      })
    );
    celebrate(creatorEvent ?? null);
    clearPointer();
  };

  const resetWizard = () => {
    dispatch(resetWizardState({ mediaType }));
    setIsProcessingTerminal(false);
    resetUpload();
    clearPointer();
    navigate(basePath, { replace: true });
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

  const isDetailsStep =
    step === 'details-1' || step === 'details-2' || step === 'details-3';

  const isProcessing =
    (step === 'thumbnail' || isDetailsStep) &&
    !!processingStatus &&
    processingStatus !== 'READY';

  const isProcessingDone =
    (step === 'thumbnail' || isDetailsStep) && processingStatus === 'READY';

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
    isFinalizeRoute,
    thumbnailUrl,
    setThumbnailUrl,
    finalMedia,
    showLeaveConfirm,
    setShowLeaveConfirm,
    isAbandoning,
    celebration,
    celebrate,
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
    continueResume,
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
