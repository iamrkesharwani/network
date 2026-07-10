export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
] as const;

export const ALLOWED_THUMBNAIL_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const VIDEO_CATEGORIES = [
  'EDUCATION',
  'ENTERTAINMENT',
  'GAMING',
  'MUSIC',
  'NEWS',
  'SPORTS',
  'TECHNOLOGY',
  'TRAVEL',
  'COMEDY',
  'OTHER',
] as const;

export const VIDEO_STATUS = [
  'UPLOADING',
  'PROCESSING',
  'READY',
  'FAILED',
] as const;

export const VIDEO_VISIBILITY = ['public', 'private', 'unlisted'] as const;

export const VIDEO_TITLE_MAX_LENGTH = 100;
export const VIDEO_DESCRIPTION_MAX_LENGTH = 5000;
export const MAX_VIDEO_SIZE_BYTES = 5 * 1024 * 1024 * 1024;
export const MAX_VIDEO_DURATION_SECONDS = 36000;
export const MAX_THUMBNAIL_SIZE_BYTES = 2 * 1024 * 1024;
export const RAW_UPLOAD_KEY_PREFIX = 'raw-uploads';
export const RAW_UPLOAD_PRESIGNED_URL_TTL_SECONDS = 60 * 60;
export const RAW_UPLOAD_LIFECYCLE_DAYS = 1;
export const UPLOAD_SESSION_TTL_SECONDS = 60 * 60 * 24;
