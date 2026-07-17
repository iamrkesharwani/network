import { z } from 'zod';
import {
  reportCreateSchema,
  reportMineQuerySchema,
} from './report.schema.js';
import {
  REPORTABLE_CONTENT_TYPES,
  type ReportReasonCode,
  type ReportStatus,
} from './report.constants.js';

export type ReportableContentType = (typeof REPORTABLE_CONTENT_TYPES)[number];
export type ReportCreateInput = z.infer<typeof reportCreateSchema>;
export type ReportMineQuery = z.infer<typeof reportMineQuerySchema>;

export interface IReportResponse {
  id: string;
  contentType: ReportableContentType;
  contentId: string;
  reasonCode: ReportReasonCode;
  status: ReportStatus;
  note?: string;
  createdAt: string;
}
