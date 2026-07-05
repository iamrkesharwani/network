import {
  MAX_SHORT_SIZE_BYTES,
  MAX_SHORT_DURATION_SECONDS,
  ALLOWED_SHORT_MIME_TYPES,
} from '@network/shared';
import {
  useInitiateUploadMutation,
  useConfirmUploadMutation,
  useDeleteShortMutation,
} from '../shortApi';
import { useMediaUpload } from '../../upload/hooks/useMediaUpload';

export const validateShortFile = (file: File): string | null => {
  if (
    !ALLOWED_SHORT_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_SHORT_MIME_TYPES)[number]
    )
  ) {
    return 'That file type is not supported. Please upload an MP4, MOV, WebM, or MKV file.';
  }
  if (file.size > MAX_SHORT_SIZE_BYTES) {
    const maxMb = Math.floor(MAX_SHORT_SIZE_BYTES / (1024 * 1024));
    return `That file is too large. The max size is ${maxMb}MB.`;
  }
  return null;
};

export const useRawShortUpload = () => {
  const [initiateUpload] = useInitiateUploadMutation();
  const [confirmUpload] = useConfirmUploadMutation();
  const [deleteShort] = useDeleteShortMutation();

  return useMediaUpload({
    validate: validateShortFile,
    maxDurationSeconds: MAX_SHORT_DURATION_SECONDS,
    durationErrorMessage:
      'That video is too long. Shorts must be under 60 seconds.',
    getInitiatedId: (initResult) => initResult.data.shortId as string,
    buildConfirmArgs: ({ id, storageKey, fileSizeBytes }) => ({
      shortId: id,
      storageKey,
      fileSizeBytes,
    }),
    initiateUpload,
    confirmUpload,
    deleteMedia: deleteShort,
  });
};
