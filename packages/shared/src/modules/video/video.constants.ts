import { CONTENT_VISIBILITY } from '../../constants/visibility.constants.js';
import { ONE_HOUR_SECONDS } from '../../constants/time.constants.js';

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

export const VIDEO_VISIBILITY = CONTENT_VISIBILITY;
export const VIDEO_TITLE_MAX_LENGTH = 100;
export const VIDEO_DESCRIPTION_MAX_LENGTH = 5000;
export const MAX_VIDEO_SIZE_BYTES = 1 * 1024 * 1024 * 1024;
export const MAX_VIDEO_DURATION_SECONDS = ONE_HOUR_SECONDS;
export const MAX_THUMBNAIL_SIZE_BYTES = 2 * 1024 * 1024;
export const RAW_UPLOAD_KEY_PREFIX = 'raw-uploads';
export const RAW_UPLOAD_PRESIGNED_URL_TTL_SECONDS = 60 * 60;
export const RAW_UPLOAD_LIFECYCLE_DAYS = 1;
export const UPLOAD_SESSION_TTL_SECONDS = 60 * 60 * 24;
export const LOCAL_TRANSCODE_OUTPUT_CONTAINER = 'mp4';
export const LOCAL_TRANSCODE_VIDEO_CODEC = 'libx264';
export const LOCAL_TRANSCODE_AUDIO_CODEC = 'aac';
export const LOCAL_TRANSCODE_PIXEL_FORMAT = 'yuv420p';
export const LOCAL_TRANSCODE_CRF = 23;
export const LOCAL_TRANSCODE_PRESET = 'veryfast';
export const LOCAL_TRANSCODE_AUDIO_BITRATE_KBPS = 128;
export const LOCAL_TRANSCODE_MOVFLAGS = '+faststart';
export const LOCAL_TRANSCODE_THUMBNAIL_TIMESTAMP_SECONDS = 1;
export const LOCAL_TRANSCODE_PROGRESS_MIN_INTERVAL_MS = 1000;
export const FFMPEG_EXEC_OPTIONS = { maxBuffer: 10 * 1024 * 1024 };
export const FFMPEG_STDERR_TAIL_MAX_CHARS = 2000;
