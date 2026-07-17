import { THIRTY_DAYS_MS, SIXTY_DAYS_MS } from '../../general/time.constants.js';

export const TRUST_SIGNAL_WINDOW_MS = THIRTY_DAYS_MS;
export const TRUST_SIGNAL_DIMINISHING_MULTIPLIERS = [1, 0.7, 0.5, 0.3] as const;
export const TRUST_SIGNAL_DIMINISHING_FLOOR = 0.3;
export const TRUST_DECAY_QUEUE_NAME = 'trust-decay';
export const TRUST_DECAY_JOB_ID = 'trust-decay';
export const TRUST_DECAY_INTERVAL_MS = THIRTY_DAYS_MS;
export const TRUST_DECAY_INACTIVITY_THRESHOLD_MS = SIXTY_DAYS_MS;
export const TRUST_DECAY_POINTS = 10;
