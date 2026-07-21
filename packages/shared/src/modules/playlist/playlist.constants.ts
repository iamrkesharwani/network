export const PLAYLIST_CONTENT_TYPES = ['video', 'short'] as const;
export const PLAYLIST_TITLE_MAX_LENGTH = 100;
export const PLAYLIST_DESCRIPTION_MAX_LENGTH = 1000;

export const PLAYLIST_QUEUE_PARAM = 'playlist';

export const ALLOWED_PLAYLIST_COVER_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export const MAX_PLAYLIST_COVER_SIZE_BYTES = 2 * 1024 * 1024;
export const PLAYLIST_COVER_ASPECT_RATIO = 1;
export const PLAYLIST_COVER_WIDTH_PX = 512;
export const PLAYLIST_COVER_HEIGHT_PX = 512;
