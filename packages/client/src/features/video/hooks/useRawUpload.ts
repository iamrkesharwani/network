import { useCallback, useRef, useState } from 'react';
import axios from 'axios';
import {
  MAX_VIDEO_SIZE_BYTES,
  MAX_VIDEO_DURATION_SECONDS,
  ALLOWED_VIDEO_MIME_TYPES,
} from '@network/shared';
import {
  useInitiateUploadMutation,
  useConfirmUploadMutation,
  useDeleteVideoMutation,
} from '../videoApi';

const rawHttp = axios.create();

export type UploadStage =
  | 'idle'
  | 'validating'
  | 'requesting'
  | 'uploading'
  | 'confirming'
  | 'done'
  | 'error'
  | 'cancelled';

export interface UploadState {
  stage: UploadStage;
  file: File | null;
  videoId: string | null;
  progressPercent: number;
  uploadedBytes: number;
  totalBytes: number;
  speedBytesPerSec: number;
  etaSeconds: number | null;
  error: string | null;
}

const initialState: UploadState = {
  stage: 'idle',
  file: null,
  videoId: null,
  progressPercent: 0,
  uploadedBytes: 0,
  totalBytes: 0,
  speedBytesPerSec: 0,
  etaSeconds: null,
  error: null,
};

const readVideoDuration = (file: File): Promise<number | undefined> =>
  new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const url = URL.createObjectURL(file);
    video.src = url;
    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration)
        ? Math.round(video.duration)
        : undefined;
      cleanup();
      resolve(duration);
    };

    video.onerror = () => {
      cleanup();
      resolve(undefined);
    };
  });

export const validateVideoFile = (file: File): string | null => {
  if (
    !ALLOWED_VIDEO_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_VIDEO_MIME_TYPES)[number]
    )
  ) {
    return 'That file type is not supported. Please upload an MP4, MOV, WebM, or MKV file.';
  }
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    const maxGb = Math.floor(MAX_VIDEO_SIZE_BYTES / (1024 * 1024 * 1024));
    return `That file is too large. The max size is ${maxGb}GB.`;
  }
  return null;
};

export const useRawUpload = () => {
  const [state, setState] = useState<UploadState>(initialState);
  const controllerRef = useRef<AbortController | null>(null);
  const speedSampleRef = useRef<{ time: number; loaded: number } | null>(null);
  const smoothedSpeedRef = useRef(0);

  const [initiateUpload] = useInitiateUploadMutation();
  const [confirmUpload] = useConfirmUploadMutation();
  const [deleteVideo] = useDeleteVideoMutation();

  const reset = useCallback(() => {
    controllerRef.current = null;
    speedSampleRef.current = null;
    smoothedSpeedRef.current = 0;
    setState(initialState);
  }, []);

  const startUpload = useCallback(
    async (file: File) => {
      const validationError = validateVideoFile(file);
      if (validationError) {
        setState({ ...initialState, stage: 'error', error: validationError });
        return;
      }

      setState({
        ...initialState,
        stage: 'validating',
        file,
        totalBytes: file.size,
      });

      const durationSeconds = await readVideoDuration(file);
      if (durationSeconds && durationSeconds > MAX_VIDEO_DURATION_SECONDS) {
        setState({
          ...initialState,
          stage: 'error',
          file,
          error: 'That video is too long. The max duration is 10 hours.',
        });
        return;
      }

      setState((prev) => ({ ...prev, stage: 'requesting' }));

      let videoId: string;
      let presignedUrl: string;
      let storageKey: string;

      try {
        const initResult = await initiateUpload({
          fileName: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type as (typeof ALLOWED_VIDEO_MIME_TYPES)[number],
          ...(durationSeconds !== undefined && { durationSeconds }),
        }).unwrap();

        videoId = initResult.data.videoId;
        presignedUrl = initResult.data.presignedUrl;
        storageKey = initResult.data.storageKey;
      } catch {
        setState((prev) => ({
          ...prev,
          stage: 'error',
          error: "Couldn't start the upload. Please try again.",
        }));
        return;
      }

      setState((prev) => ({ ...prev, stage: 'uploading', videoId }));

      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        await rawHttp.put(presignedUrl, file, {
          headers: { 'Content-Type': file.type },
          signal: controller.signal,
          onUploadProgress: (event) => {
            const loaded = event.loaded;
            const total = event.total ?? file.size;
            const now = performance.now();
            const lastSample = speedSampleRef.current;

            if (lastSample) {
              const dt = (now - lastSample.time) / 1000;
              const dBytes = loaded - lastSample.loaded;

              if (dt > 0.15) {
                const instantSpeed = dBytes / dt;
                smoothedSpeedRef.current =
                  smoothedSpeedRef.current === 0
                    ? instantSpeed
                    : smoothedSpeedRef.current * 0.7 + instantSpeed * 0.3;
                speedSampleRef.current = { time: now, loaded };
              }
            } else {
              speedSampleRef.current = { time: now, loaded };
            }

            const speed = smoothedSpeedRef.current;
            const remaining = total - loaded;
            const eta = speed > 0 ? Math.round(remaining / speed) : null;

            setState((prev) => ({
              ...prev,
              uploadedBytes: loaded,
              totalBytes: total,
              progressPercent: Math.min(
                100,
                Math.round((loaded / total) * 100)
              ),
              speedBytesPerSec: speed,
              etaSeconds: eta,
            }));
          },
        });
      } catch (err) {
        if (axios.isCancel(err) || controller.signal.aborted) {
          setState((prev) => ({ ...prev, stage: 'cancelled' }));
        } else {
          setState((prev) => ({
            ...prev,
            stage: 'error',
            error: 'The upload was interrupted. Please try again.',
          }));
        }
        return;
      }

      setState((prev) => ({ ...prev, stage: 'confirming' }));

      try {
        await confirmUpload({
          videoId,
          storageKey,
          fileSizeBytes: file.size,
        }).unwrap();

        setState((prev) => ({
          ...prev,
          stage: 'done',
          progressPercent: 100,
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          stage: 'error',
          error: "Upload finished, but we couldn't confirm it. Please retry.",
        }));
      }
    },
    [confirmUpload, initiateUpload]
  );

  const cancelUpload = useCallback(() => {
    controllerRef.current?.abort();
    const { videoId } = state;
    if (videoId) {
      deleteVideo(videoId).catch(() => undefined);
    }
    reset();
  }, [deleteVideo, reset, state]);

  return { state, startUpload, cancelUpload, reset };
};
