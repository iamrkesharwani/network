import { FIVE_MINUTES_MS, SEVEN_DAYS_SECONDS } from './time.constants.js';

export const WATCH_PROGRESS_REDIS_KEY_PREFIX = 'watch:';
export const WATCH_PROGRESS_REDIS_TTL_SECONDS = SEVEN_DAYS_SECONDS;
export const TELEMETRY_FLUSH_QUEUE_NAME = 'telemetry-flush';
export const TELEMETRY_FLUSH_JOB_ID = 'telemetry-flush';
export const TELEMETRY_FLUSH_INTERVAL_MS = FIVE_MINUTES_MS;
