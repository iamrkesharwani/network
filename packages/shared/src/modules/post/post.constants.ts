import { CONTENT_VISIBILITY } from '../general/constants/general.constants.js';

export const ALLOWED_POST_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const POST_VISIBILITY = CONTENT_VISIBILITY;
export const POST_STATUS = ['READY'] as const;
export const POST_MEDIA_TYPE = ['none', 'image'] as const;
export const MAX_POST_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_POST_IMAGES = 10;
export const POST_TEXT_MAX_LENGTH = 500;
export const POST_TEXT_LINE_CLAMP = 6;
export const POST_TILE_QUOTE_THRESHOLD_CHARS = 80;
export const POST_TILE_HEIGHT_PX = 260;
export const TEXT_PREVIEW_LENGTH = 80;
export const ACCEPTED_ATTACHMENT_MIME = ALLOWED_POST_IMAGE_MIME_TYPES.join(',');
export const ROW_GAP_PX = 16;
