import { useEffect, useState } from 'react';
import type {
  IPersistedUploadPointer,
  MultipartMediaType,
  UploadState,
} from '@network/shared';
import {
  saveUploadPointer,
  loadUploadPointer,
  clearUploadPointer,
} from '../utils/uploadPersistence';

export interface UseUploadResumePointerOptions {
  mediaType: MultipartMediaType;
  uploadState: UploadState;
  step: string;
  mediaId?: string | null;
  sessionId?: string | null;
  onRestorePointer?: (pointer: IPersistedUploadPointer) => void;
}

export const useUploadResumePointer = ({
  mediaType,
  uploadState,
  step,
  mediaId,
  sessionId,
  onRestorePointer,
}: UseUploadResumePointerOptions) => {
  const [resumePointer, setResumePointer] =
    useState<IPersistedUploadPointer | null>(null);

  useEffect(() => {
    if (sessionId || mediaId) return;

    const pointer = loadUploadPointer(mediaType);
    if (!pointer) return;

    const isFullyUploaded =
      pointer.totalParts > 0 &&
      pointer.uploadedParts.length >= pointer.totalParts;

    if (onRestorePointer) {
      if (pointer.step !== 'drop' || isFullyUploaded) {
        onRestorePointer(pointer);
        return;
      }
      setResumePointer(pointer);
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
      mediaId: uploadState.videoId ?? mediaId ?? existing?.mediaId ?? '',
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
    mediaId,
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

  const discardResume = () => {
    clearUploadPointer(mediaType);
    setResumePointer(null);
  };

  const clearPointer = () => {
    clearUploadPointer(mediaType);
    setResumePointer(null);
  };

  return { resumePointer, discardResume, clearPointer };
};
