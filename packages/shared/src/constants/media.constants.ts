import {
  SIX_HOURS_SECONDS,
  FIVE_MINUTES_SECONDS,
  ONE_DAY_SECONDS,
} from './time.constants.js';

export type MediaProcessingStatus =
  | 'UPLOADING'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED';

export const PROVIDER_MEDIA_INDEX_TTL_SECONDS = 30 * 24 * 60 * 60;
export const MEDIA_STATUS_SOCKET_EVENT = 'media:status';
export const UNLISTED_EXPIRY_WARNING_SOCKET_EVENT =
  'media:unlisted-expiry-warning';
export const MEDIA_ACCESS_URL_TTL_SECONDS = SIX_HOURS_SECONDS;
export const WEBHOOK_SIGNATURE_TOLERANCE_SECONDS = FIVE_MINUTES_SECONDS;
export const BUNNY_WEBHOOK_REPLAY_TTL_SECONDS = ONE_DAY_SECONDS;
export const MEDIA_INGEST_QUEUE_NAME = 'media-ingest';
export const THUMBNAIL_KEY_PREFIX = 'thumbnails';
