import {
  REPORT_JURY_CASE_TRIGGER_COUNT,
  REPORT_REASON_CODES_BYPASSING_JURY,
  type IReportResponse,
  type ReportableContentType,
  type ReportReasonCode,
} from '@network/shared';
import * as reportRepository from '../report.repository.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { getModerationContentAdapter } from '../../../core/moderation/moderationContent.registry.js';
import { runJuryCaseTriggers } from '../report.hooks.js';
import { toResponse } from './report.mappers.js';

export const createReport = async (
  reporterId: string,
  contentType: ReportableContentType,
  contentId: string,
  reasonCode: ReportReasonCode,
  note?: string
): Promise<IReportResponse> => {
  const adapter = getModerationContentAdapter(contentType);
  if (!adapter) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      `Reporting ${contentType} content is not available yet.`
    );
  }

  const { exists, ownerId } = await adapter.lookup(contentId);
  if (!exists) {
    throw new ApiError(404, 'NOT_FOUND', 'Reported content not found.');
  }

  if (ownerId === reporterId) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'You cannot report your own content.'
    );
  }

  const existingReport = await reportRepository.findByReporterAndContent(
    reporterId,
    contentType,
    contentId
  );
  if (existingReport) {
    throw new ApiError(
      409,
      'CONFLICT',
      'You have already reported this content.'
    );
  }

  const report = await reportRepository.create(
    reporterId,
    contentType,
    contentId,
    reasonCode,
    note
  );

  if (!REPORT_REASON_CODES_BYPASSING_JURY.includes(reasonCode)) {
    const pendingCount = await reportRepository.countPendingForContent(
      contentType,
      contentId
    );

    if (pendingCount >= REPORT_JURY_CASE_TRIGGER_COUNT) {
      await reportRepository.markInReviewForContent(contentType, contentId);
      await runJuryCaseTriggers(contentType, contentId);
    }
  }

  return toResponse(report);
};

export const getMyReports = async (
  reporterId: string,
  cursor: string | null,
  limit: number
) => {
  const result = await reportRepository.findByReporterPaginated(
    reporterId,
    cursor,
    limit
  );

  return { ...result, data: result.data.map(toResponse) };
};
