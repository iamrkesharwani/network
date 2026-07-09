import { useCallback, useRef, useState } from 'react';
import axios from 'axios';
import {
  MULTIPART_MAX_RETRY_ATTEMPTS_PER_PART,
  MULTIPART_UPLOAD_CONCURRENCY_LIMIT,
  type UploadState,
  type MultipartMediaType,
} from '@network/shared';
import { computeFileFingerprint } from '../utils/fingerprint';
import {
  useInitiateMultipartUploadMutation,
  useResumeMultipartUploadMutation,
  usePresignUploadPartMutation,
  useCompleteUploadPartMutation,
  useCompleteMultipartUploadMutation,
  useAbortMultipartUploadMutation,
} from '../uploadApi';

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

const partRange = (
  partNumber: number,
  partSize: number,
  fileSizeBytes: number
): [number, number] => {
  const start = (partNumber - 1) * partSize;
  const end = Math.min(start + partSize, fileSizeBytes);
  return [start, end];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ChunkedMediaUploadConfig {
  mediaType: MultipartMediaType;

  validate: (file: File) => string | null;

  maxDurationSeconds: number;

  durationErrorMessage: string;

  deleteMedia: (id: string) => {
    catch: (onRejected: (reason: unknown) => undefined) => unknown;
  };
}

export const useChunkedMediaUpload = (config: ChunkedMediaUploadConfig) => {
  const {
    mediaType,
    validate,
    maxDurationSeconds,
    durationErrorMessage,
    deleteMedia,
  } = config;

  const [initiateMultipartUpload] = useInitiateMultipartUploadMutation();
  const [resumeMultipartUpload] = useResumeMultipartUploadMutation();
  const [presignUploadPart] = usePresignUploadPartMutation();
  const [completeUploadPart] = useCompleteUploadPartMutation();
  const [completeMultipartUpload] = useCompleteMultipartUploadMutation();
  const [abortMultipartUpload] = useAbortMultipartUploadMutation();

  const [state, setState] = useState<UploadState>(initialState);
  const cancelledRef = useRef(false);
  const activeControllersRef = useRef<Set<AbortController>>(new Set());
  const sessionIdRef = useRef<string | null>(null);
  const speedSampleRef = useRef<{ time: number; loaded: number } | null>(null);
  const smoothedSpeedRef = useRef(0);
  const partProgressRef = useRef<Map<number, number>>(new Map());

  const reset = useCallback(() => {
    cancelledRef.current = false;
    activeControllersRef.current.clear();
    sessionIdRef.current = null;
    speedSampleRef.current = null;
    smoothedSpeedRef.current = 0;
    partProgressRef.current.clear();
    setState(initialState);
  }, []);

  const reportProgress = useCallback(
    (uploadedBytes: number, totalBytes: number) => {
      const now = performance.now();
      const lastSample = speedSampleRef.current;

      if (lastSample) {
        const dt = (now - lastSample.time) / 1000;
        const dBytes = uploadedBytes - lastSample.loaded;

        if (dt > 0.15) {
          const instantSpeed = dBytes / dt;
          smoothedSpeedRef.current =
            smoothedSpeedRef.current === 0
              ? instantSpeed
              : smoothedSpeedRef.current * 0.7 + instantSpeed * 0.3;
          speedSampleRef.current = { time: now, loaded: uploadedBytes };
        }
      } else {
        speedSampleRef.current = { time: now, loaded: uploadedBytes };
      }

      const speed = smoothedSpeedRef.current;
      const remaining = totalBytes - uploadedBytes;
      const eta = speed > 0 ? Math.round(remaining / speed) : null;

      setState((prev) => ({
        ...prev,
        uploadedBytes,
        totalBytes,
        progressPercent: Math.min(
          100,
          Math.round((uploadedBytes / totalBytes) * 100)
        ),
        speedBytesPerSec: speed,
        etaSeconds: eta,
      }));
    },
    []
  );

  const reportAggregateProgress = useCallback(
    (totalBytes: number) => {
      let uploaded = 0;
      for (const bytes of partProgressRef.current.values()) uploaded += bytes;
      reportProgress(Math.min(uploaded, totalBytes), totalBytes);
    },
    [reportProgress]
  );

  const uploadPart = useCallback(
    async (
      sessionId: string,
      partNumber: number,
      blob: Blob,
      totalBytes: number
    ): Promise<{ partNumber: number; etag: string }> => {
      let lastError: unknown;

      for (
        let attempt = 1;
        attempt <= MULTIPART_MAX_RETRY_ATTEMPTS_PER_PART;
        attempt += 1
      ) {
        if (cancelledRef.current) {
          throw new Error('cancelled');
        }

        const controller = new AbortController();
        activeControllersRef.current.add(controller);

        try {
          const presignResult = await presignUploadPart({
            sessionId,
            partNumber,
          }).unwrap();
          const presigned = presignResult.data;

          const response = await rawHttp.put(presigned.uploadUrl, blob, {
            signal: controller.signal,
            onUploadProgress: (event) => {
              partProgressRef.current.set(partNumber, event.loaded);
              reportAggregateProgress(totalBytes);
            },
          });

          const etag =
            presigned.scheme === 'block-blob'
              ? presigned.blockId
              : String(
                  response.headers.etag ?? response.headers.ETag ?? ''
                ).replace(/"/g, '');

          if (!etag) {
            throw new Error('missing-etag');
          }

          await completeUploadPart({
            sessionId,
            partNumber,
            etag,
            size: blob.size,
          }).unwrap();

          partProgressRef.current.set(partNumber, blob.size);
          reportAggregateProgress(totalBytes);

          return { partNumber, etag };
        } catch (err) {
          if (cancelledRef.current || axios.isCancel(err)) {
            throw new Error('cancelled', { cause: err });
          }
          lastError = err;
          if (attempt < MULTIPART_MAX_RETRY_ATTEMPTS_PER_PART) {
            await sleep(500 * 2 ** (attempt - 1));
          }
        } finally {
          activeControllersRef.current.delete(controller);
        }
      }

      throw lastError ?? new Error(`Part ${partNumber} failed after retries`);
    },
    [presignUploadPart, completeUploadPart, reportAggregateProgress]
  );

  const startUpload = useCallback(
    async (file: File) => {
      cancelledRef.current = false;

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

      const fingerprint = computeFileFingerprint(file);
      setState((prev) => ({ ...prev, fingerprint }));

      let sessionId: string;
      let mediaId: string;
      let partSize: number;
      let totalParts: number;
      let storageKey: string;
      let completedParts: { partNumber: number; etag: string }[] = [];

      try {
        const resumeResult = await resumeMultipartUpload({
          fingerprint,
        }).unwrap();
        const resumed = resumeResult.data;
        sessionId = resumed.sessionId;
        mediaId = resumed.mediaId;
        partSize = resumed.partSize;
        totalParts = resumed.totalParts;
        storageKey = resumed.storageKey;
        completedParts = resumed.uploadedParts;
      } catch (err) {
        const status = (err as { status?: number })?.status;
        if (status !== 404) {
          setState((prev) => ({
            ...prev,
            stage: 'error',
            error: "Couldn't start the upload. Please try again.",
          }));
          return;
        }

        try {
          const initResult = await initiateMultipartUpload({
            mediaType,
            fileName: file.name,
            fileSizeBytes: file.size,
            mimeType: file.type,
            fingerprint,
            ...(durationSeconds !== undefined && { durationSeconds }),
          }).unwrap();

          const initiated = initResult.data;
          sessionId = initiated.sessionId;
          mediaId = initiated.mediaId;
          partSize = initiated.partSize;
          totalParts = initiated.totalParts;
          storageKey = initiated.storageKey;
        } catch {
          setState((prev) => ({
            ...prev,
            stage: 'error',
            error: "Couldn't start the upload. Please try again.",
          }));
          return;
        }
      }

      sessionIdRef.current = sessionId;
      setState((prev) => ({
        ...prev,
        stage: 'uploading',
        videoId: mediaId,
        sessionId,
        totalParts,
        storageKey,
        uploadedParts: completedParts.map((part) => part.partNumber),
      }));

      const completedByNumber = new Map(
        completedParts.map((part) => [part.partNumber, part.etag])
      );

      partProgressRef.current.clear();
      const pendingParts: number[] = [];
      for (let n = 1; n <= totalParts; n += 1) {
        if (completedByNumber.has(n)) {
          const [start, end] = partRange(n, partSize, file.size);
          partProgressRef.current.set(n, end - start);
        } else {
          pendingParts.push(n);
        }
      }
      reportAggregateProgress(file.size);

      try {
        let nextIndex = 0;
        const runWorker = async () => {
          for (;;) {
            if (cancelledRef.current) throw new Error('cancelled');
            const partNumber = pendingParts[nextIndex];
            nextIndex += 1;
            if (partNumber === undefined) return;

            const [start, end] = partRange(partNumber, partSize, file.size);
            const blob = file.slice(start, end);

            const { etag } = await uploadPart(
              sessionId,
              partNumber,
              blob,
              file.size
            );

            completedByNumber.set(partNumber, etag);
            setState((prev) => ({
              ...prev,
              uploadedParts: Array.from(completedByNumber.keys()),
            }));
          }
        };

        const workerCount = Math.min(
          MULTIPART_UPLOAD_CONCURRENCY_LIMIT,
          pendingParts.length
        );
        await Promise.all(
          Array.from({ length: workerCount }, () => runWorker())
        );
      } catch (err) {
        const wasCancelled =
          cancelledRef.current || (err as Error)?.message === 'cancelled';

        activeControllersRef.current.forEach((controller) =>
          controller.abort()
        );
        activeControllersRef.current.clear();

        if (wasCancelled) {
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
        const orderedParts = Array.from(completedByNumber.entries())
          .map(([partNumber, etag]) => ({ partNumber, etag }))
          .sort((a, b) => a.partNumber - b.partNumber);

        await completeMultipartUpload({
          sessionId,
          parts: orderedParts,
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
    [
      mediaType,
      validate,
      maxDurationSeconds,
      durationErrorMessage,
      initiateMultipartUpload,
      resumeMultipartUpload,
      completeMultipartUpload,
      reportAggregateProgress,
      uploadPart,
    ]
  );

  const cancelUpload = useCallback(() => {
    cancelledRef.current = true;
    activeControllersRef.current.forEach((controller) => controller.abort());
    activeControllersRef.current.clear();

    const { videoId: id } = state;
    const sessionId = sessionIdRef.current;

    if (sessionId) {
      abortMultipartUpload({ sessionId }).catch(() => undefined);
    }
    if (id) {
      deleteMedia(id).catch(() => undefined);
    }
    reset();
  }, [abortMultipartUpload, deleteMedia, reset, state]);

  return { state, startUpload, cancelUpload, reset };
};
