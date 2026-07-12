import { ONE_YEAR_SECONDS } from './time.constants.js';

export const SITE_NAME = 'Network';
export const DEFAULT_API_URL = 'http://localhost:5000/api/v1';
export const EMAIL_QUEUE_NAME = 'email';
export const HSTS_MAX_AGE_SECONDS = ONE_YEAR_SECONDS;

export const VIEW_MODES = ['grid', 'list'] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export const PROCESS_ROLES = ['web', 'worker'] as const;
export type ProcessRole = (typeof PROCESS_ROLES)[number];
