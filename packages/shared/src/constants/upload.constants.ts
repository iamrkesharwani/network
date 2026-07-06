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

export const MULTIPART_MEDIA_TYPES = ['video', 'short', 'post'] as const;
export const MULTIPART_PART_SIZE_BYTES = 8 * 1024 * 1024;
export const MULTIPART_MIN_PART_SIZE_BYTES = 5 * 1024 * 1024;
export const MULTIPART_SESSION_TTL_SECONDS = 60 * 60 * 24;
export const MULTIPART_MAX_RETRY_ATTEMPTS_PER_PART = 3;
