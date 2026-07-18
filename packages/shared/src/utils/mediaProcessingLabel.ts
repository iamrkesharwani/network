import type { MediaProcessingStatus } from '../modules/content/types/media.types.js';

export interface MediaProcessingLabel {
  text: string;
  isFailed: boolean;
}

export const getMediaProcessingLabel = (
  status: MediaProcessingStatus,
  progress?: number
): MediaProcessingLabel => {
  if (status === 'FAILED') {
    return { text: '⚠ Processing failed', isFailed: true };
  }

  if (status === 'PROCESSING') {
    return {
      text:
        progress !== undefined ? `Processing — ${progress}%` : 'Processing…',
      isFailed: false,
    };
  }

  return { text: 'Uploading…', isFailed: false };
};
