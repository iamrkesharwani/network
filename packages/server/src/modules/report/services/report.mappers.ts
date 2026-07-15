import type { IReportResponse } from '@network/shared';
import type { IReportDocument } from '../report.model.js';

export const toResponse = (doc: IReportDocument): IReportResponse => ({
  id: doc._id.toString(),
  contentType: doc.contentType,
  contentId: doc.contentId.toString(),
  reasonCode: doc.reasonCode,
  status: doc.status,
  ...(doc.note !== undefined && { note: doc.note }),
  createdAt: doc.createdAt.toISOString(),
});
