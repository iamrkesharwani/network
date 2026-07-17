import type { ReportReasonCode } from './report.types.js';

export const REPORT_NOTE_MAX_LENGTH = 500;
export const REPORT_JURY_CASE_TRIGGER_COUNT = 3;
export const REPORT_REASON_CODES_BYPASSING_JURY: ReportReasonCode[] = ['CSAM'];

export const REPORTABLE_CONTENT_TYPES = [
  'video',
  'short',
  'post',
  'comment',
] as const;

export const REPORT_REASON_CATALOG = {
  SPAM: { label: 'Spam' },
  HARASSMENT: { label: 'Harassment or bullying' },
  MISINFORMATION: { label: 'Misinformation' },
  AI_UNDISCLOSED: { label: 'Undisclosed AI-generated content' },
  COPYRIGHT: { label: 'Copyright infringement' },
  CSAM: { label: 'Child sexual abuse material' },
  OTHER: { label: 'Other' },
} as const;

export const REPORT_REASON_CODES = Object.keys(
  REPORT_REASON_CATALOG
) as (keyof typeof REPORT_REASON_CATALOG)[];

export const REPORT_STATUS = [
  'pending',
  'in_review',
  'resolved',
  'dismissed',
] as const;
