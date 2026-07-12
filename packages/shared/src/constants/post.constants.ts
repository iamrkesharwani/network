import { CONTENT_VISIBILITY } from './visibility.constants.js';

export const POST_VISIBILITY = CONTENT_VISIBILITY;

export const POST_STATUS = ['READY'] as const;

export const POST_MEDIA_TYPE = ['none', 'image'] as const;

export const ALLOWED_POST_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_POST_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_POST_IMAGES = 10;
export const POST_TEXT_MAX_LENGTH = 500;
export const POST_TEXT_LINE_CLAMP = 6;
