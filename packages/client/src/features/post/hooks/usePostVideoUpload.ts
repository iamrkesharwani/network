import {
  MAX_POST_VIDEO_SIZE_BYTES,
  MAX_POST_VIDEO_DURATION_SECONDS,
  ALLOWED_POST_VIDEO_MIME_TYPES,
} from '@network/shared';
import {
  useInitiateVideoUploadMutation,
  useConfirmVideoUploadMutation,
  useDeletePostMutation,
} from '../postApi';
import { useMediaUpload } from '../../upload/hooks/useMediaUpload';

export const validatePostVideoFile = (file: File): string | null => {
  if (
    !ALLOWED_POST_VIDEO_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_POST_VIDEO_MIME_TYPES)[number]
    )
  ) {
    return 'That file type is not supported. Please upload an MP4, MOV, WebM, or MKV file.';
  }
  if (file.size > MAX_POST_VIDEO_SIZE_BYTES) {
    const maxMb = Math.floor(MAX_POST_VIDEO_SIZE_BYTES / (1024 * 1024));
    return `That file is too large. The max size is ${maxMb}MB.`;
  }
  return null;
};

export const useRawPostVideoUpload = () => {
  const [initiateVideoUpload] = useInitiateVideoUploadMutation();
  const [confirmVideoUpload] = useConfirmVideoUploadMutation();
  const [deletePost] = useDeletePostMutation();

  return useMediaUpload({
    validate: validatePostVideoFile,
    maxDurationSeconds: MAX_POST_VIDEO_DURATION_SECONDS,
    durationErrorMessage:
      'That video is too long. Post videos must be under 60 seconds.',
    getInitiatedId: (initResult) => initResult.data.postId as string,
    buildConfirmArgs: ({ id, storageKey, fileSizeBytes }) => ({
      postId: id,
      storageKey,
      fileSizeBytes,
    }),
    initiateUpload: initiateVideoUpload,
    confirmUpload: confirmVideoUpload,
    deleteMedia: deletePost,
  });
};
