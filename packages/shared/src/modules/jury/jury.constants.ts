import {
  SEVENTY_TWO_HOURS_MS,
  ONE_HOUR_SECONDS,
} from '../general/time.constants.js';

export const JURY_QUEUE_NAME = 'jury-assignment';
export const JURY_JOB_ID_PREFIX = 'jury-case';

export const JURY_TIMEOUT_QUEUE_NAME = 'jury-timeout-sweep';
export const JURY_TIMEOUT_JOB_ID = 'jury-timeout-sweep';
export const JURY_TIMEOUT_SWEEP_INTERVAL_MS = ONE_HOUR_SECONDS * 1000;

export const JURY_POOL_SIZE = 5;
export const JURY_CONSENSUS_THRESHOLD = 4;
export const JURY_CASE_TIMEOUT_MS = SEVENTY_TWO_HOURS_MS;

export const JURY_CASE_STATUS = [
  'open',
  'deciding',
  'resolved',
  'appealed',
] as const;

export const JURY_VERDICT = ['uphold_removal', 'no_action'] as const;

export const JURY_VOTE_CHOICES = ['remove', 'no_action'] as const;

export const JUROR_COOLDOWN_MS = SEVENTY_TWO_HOURS_MS;

export const SENIOR_JUROR_MIN_SCORE = 800;

export const APPEAL_STATUS = ['pending', 'upheld', 'overturned'] as const;
