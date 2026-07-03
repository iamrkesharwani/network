export const TAG_REGEX = /^[a-z0-9]+$/;
export const MAX_TAGS = 10;
export const MIN_TAG_LENGTH = 2;
export const MAX_TAG_LENGTH = 20;
export const RING_SIZE = 168;
export const RING_STROKE = 8;
export const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

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
