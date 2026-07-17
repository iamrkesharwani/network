import type { JuryVerdict } from '@network/shared';
import { getModerationContentAdapter } from '../../../core/moderation/moderationContent.registry.js';
import { applyTrustSignal } from '../../creator/services/creator.trust.signals.service.js';
import * as juryCaseRepository from '../repository/jury-case.repository.js';
import * as juryAssignmentRepository from '../repository/jury-assignment.repository.js';
import * as juryAppealRepository from '../repository/jury-appeal.repository.js';
import * as reportRepository from '../../report/report.repository.js';
import type { IJuryCaseDocument } from '../models/jury-case.model.js';

const applyVerdictSideEffects = async (
  juryCase: IJuryCaseDocument,
  verdict: JuryVerdict,
  options: { isTimeout: boolean }
): Promise<void> => {
  const caseId = juryCase._id.toString();
  const contentId = juryCase.contentId.toString();

  if (!options.isTimeout) {
    const assignments = await juryAssignmentRepository.findForCase(caseId);
    const majoritySide = verdict === 'uphold_removal' ? 'remove' : 'no_action';

    for (const assignment of assignments) {
      if (!assignment.vote) continue;
      const signal =
        assignment.vote === majoritySide
          ? 'JURY_VOTE_MAJORITY'
          : 'JURY_VOTE_MINORITY';
      await applyTrustSignal(assignment.jurorId.toString(), signal);
    }
  }

  if (juryCase.isAppeal) {
    const appeal = await juryAppealRepository.findByAppealCaseId(caseId);
    if (appeal && appeal.status === 'pending') {
      const appealStatus =
        verdict === 'uphold_removal' ? 'upheld' : 'overturned';
      await juryAppealRepository.resolve(appeal._id.toString(), appealStatus);

      if (appealStatus === 'overturned') {
        const adapter = getModerationContentAdapter(juryCase.contentType);
        await adapter?.setModerationStatus(contentId, 'active');
      }
    }
    return;
  }

  if (verdict === 'uphold_removal') {
    const adapter = getModerationContentAdapter(juryCase.contentType);
    await adapter?.setModerationStatus(contentId, 'jury_removed');
    await reportRepository.markResolvedForContent(
      juryCase.contentType,
      contentId
    );

    if (!options.isTimeout) {
      const reporterIds = await reportRepository.findReporterIdsForContent(
        juryCase.contentType,
        contentId
      );
      for (const reporterId of reporterIds) {
        await applyTrustSignal(reporterId, 'VALID_REPORT_FILED');
      }
    }
  } else {
    await reportRepository.markDismissedForContent(
      juryCase.contentType,
      contentId
    );

    if (!options.isTimeout) {
      const reporterIds = await reportRepository.findReporterIdsForContent(
        juryCase.contentType,
        contentId
      );
      for (const reporterId of reporterIds) {
        await applyTrustSignal(reporterId, 'FALSE_REPORT_FILED');
      }
    }
  }
};

export const checkAndFinalize = async (caseId: string): Promise<void> => {
  const juryCase = await juryCaseRepository.findById(caseId);
  if (
    !juryCase ||
    juryCase.status === 'resolved' ||
    juryCase.status === 'appealed'
  ) {
    return;
  }

  const counts = await juryAssignmentRepository.countVotes(caseId);

  let verdict: JuryVerdict | null = null;
  if (counts.remove >= juryCase.consensusThreshold) {
    verdict = 'uphold_removal';
  } else if (counts.noAction >= juryCase.consensusThreshold) {
    verdict = 'no_action';
  }

  if (!verdict) return;

  const finalized = await juryCaseRepository.finalize(caseId, verdict);
  if (!finalized) return;

  await applyVerdictSideEffects(finalized, verdict, { isTimeout: false });
};

export const finalizeTimedOutCase = async (
  juryCase: IJuryCaseDocument
): Promise<void> => {
  const verdict: JuryVerdict = juryCase.isAppeal
    ? 'uphold_removal'
    : 'no_action';

  const finalized = await juryCaseRepository.finalize(
    juryCase._id.toString(),
    verdict
  );
  if (!finalized) return;

  await applyVerdictSideEffects(finalized, verdict, { isTimeout: true });
};
