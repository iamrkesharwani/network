export const POST_VISIBILITY = ['public', 'private', 'unlisted'] as const;

export const POST_STATUS = [
  'UPLOADING',
  'PROCESSING',
  'READY',
  'FAILED',
] as const;

export const POST_MEDIA_TYPE = ['none', 'image', 'video'] as const;

export const ALLOWED_POST_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const ALLOWED_POST_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
] as const;

export const MAX_POST_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_POST_VIDEO_SIZE_BYTES = 500 * 1024 * 1024;
export const MAX_POST_VIDEO_DURATION_SECONDS = 60;
export const RAW_POST_UPLOAD_KEY_PREFIX = 'raw-post-uploads';
export const RAW_POST_UPLOAD_PRESIGNED_URL_TTL_SECONDS = 60 * 60;
export const RAW_POST_UPLOAD_LIFECYCLE_DAYS = 1;
export const POST_UPLOAD_STEP = 'drop';
export const POST_TEXT_MAX_LENGTH = 500;
export const POST_TEXT_LINE_CLAMP = 6;
