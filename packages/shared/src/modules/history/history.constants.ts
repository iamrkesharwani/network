import {
  FIVE_MINUTES_MS,
  SEVEN_DAYS_SECONDS,
} from '../general/time.constants.js';

export const HISTORY_CONTENT_TYPES = ['video', 'short'] as const;
export const HISTORY_COMPLETED_THRESHOLD = 0.95;
export const HISTORY_PROGRESS_REDIS_KEY_PREFIX = 'watch:';
export const HISTORY_PROGRESS_REDIS_TTL_SECONDS = SEVEN_DAYS_SECONDS;
export const HISTORY_FLUSH_QUEUE_NAME = 'history-flush';
export const HISTORY_FLUSH_JOB_ID = 'history-flush';
export const HISTORY_FLUSH_INTERVAL_MS = FIVE_MINUTES_MS;
