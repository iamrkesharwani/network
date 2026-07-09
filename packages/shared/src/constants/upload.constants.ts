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
  sessionId: string | null;
  fingerprint: string | null;
  uploadedParts: number[];
  totalParts: number;
  storageKey: string | null;
}

import { FIFTEEN_MINUTES_MS } from './time.constants.js';

export const UPLOAD_REAPER_QUEUE_NAME = 'upload-session-reaper';
export const UPLOAD_REAPER_JOB_ID = 'upload-session-reaper';
export const UPLOAD_REAPER_INTERVAL_MS = FIFTEEN_MINUTES_MS;

export const MULTIPART_MEDIA_TYPES = ['video', 'short', 'post'] as const;
export const MULTIPART_PART_SIZE_BYTES = 8 * 1024 * 1024;
export const MULTIPART_MIN_PART_SIZE_BYTES = 5 * 1024 * 1024;
export const MULTIPART_SESSION_TTL_SECONDS = 60 * 60 * 24;
export const MULTIPART_SESSION_REAP_GRACE_SECONDS = 60 * 60;
export const MULTIPART_MAX_RETRY_ATTEMPTS_PER_PART = 3;
export const PERSISTED_UPLOAD_POINTER_TTL_MS = 24 * 60 * 60 * 1000;
export const MULTIPART_UPLOAD_CONCURRENCY_LIMIT = 4;
