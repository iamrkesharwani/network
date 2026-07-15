import { SEVENTY_TWO_HOURS_MS } from './time.constants.js';

export const JURY_QUEUE_NAME = 'jury-assignment';
export const JURY_JOB_ID_PREFIX = 'jury-case';

export const JURY_POOL_SIZE = 5;
export const JURY_CONSENSUS_THRESHOLD = 4;
export const JURY_CASE_TIMEOUT_MS = SEVENTY_TWO_HOURS_MS;

export const JURY_CASE_STATUS = [
  'open',
  'deciding',
  'resolved',
  'appealed',
] as const;
export type JuryCaseStatus = (typeof JURY_CASE_STATUS)[number];

export const JURY_VERDICT = ['uphold_removal', 'no_action'] as const;
export type JuryVerdict = (typeof JURY_VERDICT)[number];

export const JURY_VOTE_CHOICES = ['remove', 'no_action'] as const;
export type JuryVoteChoice = (typeof JURY_VOTE_CHOICES)[number];

export const JUROR_COOLDOWN_MS = SEVENTY_TWO_HOURS_MS;

export const SENIOR_JUROR_MIN_SCORE = 800;

export const APPEAL_STATUS = ['pending', 'upheld', 'overturned'] as const;
export type AppealStatus = (typeof APPEAL_STATUS)[number];
