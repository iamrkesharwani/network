import { z } from 'zod';
import { reportCreateSchema, reportMineQuerySchema } from './report.schema.js';
import {
  REPORT_REASON_CODES,
  REPORT_STATUS,
  REPORTABLE_CONTENT_TYPES,
} from './report.constants.js';

export type ReportableContentType = (typeof REPORTABLE_CONTENT_TYPES)[number];
export type ReportCreateInput = z.infer<typeof reportCreateSchema>;
export type ReportMineQuery = z.infer<typeof reportMineQuerySchema>;
export type ReportReasonCode = (typeof REPORT_REASON_CODES)[number];
export type ReportStatus = (typeof REPORT_STATUS)[number];

export interface IReportResponse {
  id: string;
  contentType: ReportableContentType;
  contentId: string;
  reasonCode: ReportReasonCode;
  status: ReportStatus;
  note?: string;
  createdAt: string;
}
