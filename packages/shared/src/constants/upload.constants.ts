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
