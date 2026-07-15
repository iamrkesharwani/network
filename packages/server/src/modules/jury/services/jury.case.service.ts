import type { ReportableContentType } from '@network/shared';
import * as juryCaseRepository from '../repository/jury-case.repository.js';
import * as reportRepository from '../../report/report.repository.js';
import { enqueueJuryAssignment } from '../jury-assignment.queue.js';

export const openCaseFromReport = async (
  contentType: ReportableContentType,
  contentId: string
): Promise<void> => {
  const existing = await juryCaseRepository.findOpenCaseForContent(
    contentType,
    contentId
  );
  if (existing) return;

  const latestReport = await reportRepository.findLatestForContent(
    contentType,
    contentId
  );

  const juryCase = await juryCaseRepository.createCase(
    contentType,
    contentId,
    latestReport?.reasonCode ?? null
  );

  await enqueueJuryAssignment({
    caseId: juryCase._id.toString(),
    seniorOnly: false,
  });
};
