export const SHORT_TITLE_MAX_LENGTH = 100;
export const SHORT_DESCRIPTION_MAX_LENGTH = 500;

export const MAX_SHORT_DURATION_SECONDS = 60;
export const REQUIRED_SHORT_ASPECT_RATIO = '9:16';
export const MAX_SHORT_SIZE_BYTES = 500 * 1024 * 1024;
export const ALLOWED_SHORT_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
] as const;
export const RAW_SHORT_UPLOAD_KEY_PREFIX = 'raw-short-uploads';
export const RAW_SHORT_UPLOAD_PRESIGNED_URL_TTL_SECONDS = 60 * 60;
export const RAW_SHORT_UPLOAD_LIFECYCLE_DAYS = 1;
export const SHORT_UPLOAD_SESSION_TTL_SECONDS = 60 * 60 * 24;

export const SHORT_VISIBILITY = ['public', 'private', 'unlisted'] as const;

export const SHORT_STATUS = [
  'UPLOADING',
  'PROCESSING',
  'READY',
  'FAILED',
] as const;
