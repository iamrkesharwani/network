import { useCallback, useRef, useState } from 'react';
import axios from 'axios';
import { type UploadState } from '@network/shared';

const rawHttp = axios.create();

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
  sessionId: null,
  fingerprint: null,
  uploadedParts: [],
  totalParts: 0,
  storageKey: null,
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

interface BaseInitiateUploadData {
  presignedUrl: string;
  storageKey: string;
}

interface InitiateUploadResult<
  TInitiateData extends BaseInitiateUploadData = BaseInitiateUploadData,
> {
  data: TInitiateData;
}

export interface MediaUploadConfig<
  TConfirmArgs,
  TMimeType extends string = string,
  TInitiateData extends BaseInitiateUploadData = BaseInitiateUploadData,
> {
  validate: (file: File) => string | null;

  maxDurationSeconds: number;

  durationErrorMessage: string;

  getInitiatedId: (initResult: InitiateUploadResult<TInitiateData>) => string;

  buildConfirmArgs: (args: {
    id: string;
    storageKey: string;
    fileSizeBytes: number;
  }) => TConfirmArgs;

  initiateUpload: (args: {
    fileName: string;
    fileSizeBytes: number;
    mimeType: TMimeType;
    durationSeconds?: number;
  }) => { unwrap: () => Promise<InitiateUploadResult<TInitiateData>> };

  confirmUpload: (args: TConfirmArgs) => { unwrap: () => Promise<unknown> };

  deleteMedia: (id: string) => {
    catch: (onRejected: (reason: unknown) => undefined) => unknown;
  };
}

export const useMediaUpload = <
  TConfirmArgs,
  TMimeType extends string = string,
  TInitiateData extends BaseInitiateUploadData = BaseInitiateUploadData,
>(
  config: MediaUploadConfig<TConfirmArgs, TMimeType, TInitiateData>
) => {
  const {
    validate,
    maxDurationSeconds,
    durationErrorMessage,
    getInitiatedId,
    buildConfirmArgs,
    initiateUpload,
    confirmUpload,
    deleteMedia,
  } = config;

  const [state, setState] = useState<UploadState>(initialState);
  const controllerRef = useRef<AbortController | null>(null);
  const speedSampleRef = useRef<{ time: number; loaded: number } | null>(null);
  const smoothedSpeedRef = useRef(0);

  const reset = useCallback(() => {
    controllerRef.current = null;
    speedSampleRef.current = null;
    smoothedSpeedRef.current = 0;
    setState(initialState);
  }, []);

  const startUpload = useCallback(
    async (file: File) => {
      const validationError = validate(file);
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
      if (durationSeconds && durationSeconds > maxDurationSeconds) {
        setState({
          ...initialState,
          stage: 'error',
          file,
          error: durationErrorMessage,
        });
        return;
      }

      setState((prev) => ({ ...prev, stage: 'requesting' }));

      let id: string;
      let presignedUrl: string;
      let storageKey: string;

      try {
        const initResult = await initiateUpload({
          fileName: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type as TMimeType,
          ...(durationSeconds !== undefined && { durationSeconds }),
        }).unwrap();

        id = getInitiatedId(initResult);
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

      setState((prev) => ({ ...prev, stage: 'uploading', videoId: id }));

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
        await confirmUpload(
          buildConfirmArgs({ id, storageKey, fileSizeBytes: file.size })
        ).unwrap();

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
    [
      initiateUpload,
      confirmUpload,
      buildConfirmArgs,
      getInitiatedId,
      validate,
      maxDurationSeconds,
      durationErrorMessage,
    ]
  );

  const cancelUpload = useCallback(() => {
    controllerRef.current?.abort();
    const { videoId: id } = state;
    if (id) {
      deleteMedia(id).catch(() => undefined);
    }
    reset();
  }, [deleteMedia, reset, state]);

  return { state, startUpload, cancelUpload, reset };
};
