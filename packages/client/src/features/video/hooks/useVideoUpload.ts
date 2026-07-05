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
import { useMediaUpload } from '../../upload/hooks/useMediaUpload';

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
  const [initiateUpload] = useInitiateUploadMutation();
  const [confirmUpload] = useConfirmUploadMutation();
  const [deleteVideo] = useDeleteVideoMutation();

  return useMediaUpload({
    validate: validateVideoFile,
    maxDurationSeconds: MAX_VIDEO_DURATION_SECONDS,
    durationErrorMessage:
      'That video is too long. The max duration is 10 hours.',
    getInitiatedId: (initResult) => initResult.data.videoId as string,
    buildConfirmArgs: ({ id, storageKey, fileSizeBytes }) => ({
      videoId: id,
      storageKey,
      fileSizeBytes,
    }),
    initiateUpload,
    confirmUpload,
    deleteMedia: deleteVideo,
  });
};
