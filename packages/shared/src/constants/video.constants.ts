export const MAX_VIDEO_SIZE_BYTES = 5 * 1024 * 1024 * 1024;
export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-matroska',
] as const;
export const MAX_VIDEO_DURATION_SECONDS = 43200;
export const MAX_THUMBNAIL_SIZE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_THUMBNAIL_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;