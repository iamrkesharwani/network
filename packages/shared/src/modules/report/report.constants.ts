import type { ReportReasonCode } from './report.types.js';
import { ENGAGEABLE_CONTENT_TYPES } from '../../core/contentRef/contentRef.constants.js';

export const REPORT_NOTE_MAX_LENGTH = 500;
export const REPORT_DISCLOSED_CONTENT_MAX_LENGTH = 2000;
export const REPORT_JURY_CASE_TRIGGER_COUNT = 3;
export const REPORT_REASON_CODES_BYPASSING_JURY: ReportReasonCode[] = ['CSAM'];

// Reportable content is the engageable set (video/short/post/comment) plus
// message/conversation - its own list, deliberately NOT aliased to
// ENGAGEABLE_CONTENT_TYPES, since messages/conversations are reportable but
// (unlike the rest of that set) never likeable, commentable, or shareable.
export const REPORTABLE_CONTENT_TYPES = [
  ...ENGAGEABLE_CONTENT_TYPES,
  'message',
  'conversation',
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
