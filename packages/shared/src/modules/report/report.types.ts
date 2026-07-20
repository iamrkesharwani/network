import { z } from 'zod';
import { reportCreateSchema, reportMineQuerySchema } from './report.schema.js';
import { REPORT_REASON_CODES, REPORT_STATUS } from './report.constants.js';
import type { EngageableContentType } from '../../core/contentRef/contentRef.types.js';

export type ReportableContentType = EngageableContentType;
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
