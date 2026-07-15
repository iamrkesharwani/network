import type { JuryVoteChoice } from '@network/shared';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as juryAssignmentRepository from '../repository/jury-assignment.repository.js';
import * as juryCaseRepository from '../repository/jury-case.repository.js';
import {
  isJuryEligible,
  isSeniorJurorEligible,
} from './jury.eligibility.service.js';
import { checkAndFinalize } from './jury.consensus.service.js';
import type { IJuryAssignmentDocument } from '../models/jury-assignment.model.js';

export const castVote = async (
  caseId: string,
  jurorId: string,
  vote: JuryVoteChoice
): Promise<IJuryAssignmentDocument> => {
  const juryCase = await juryCaseRepository.findById(caseId);
  if (!juryCase) {
    throw new ApiError(404, 'NOT_FOUND', 'Jury case not found.');
  }

  if (juryCase.status !== 'deciding') {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'This case is not open for voting.'
    );
  }

  const assignment = await juryAssignmentRepository.findForCaseAndJuror(
    caseId,
    jurorId
  );
  if (!assignment) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'You are not assigned to this case.'
    );
  }

  if (assignment.vote !== null) {
    throw new ApiError(
      409,
      'CONFLICT',
      'You have already voted on this case.'
    );
  }

  const stillEligible = juryCase.isAppeal
    ? await isSeniorJurorEligible(jurorId)
    : await isJuryEligible(jurorId);

  if (!stillEligible) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'You no longer meet the trust score required to vote on this case.'
    );
  }

  const updated = await juryAssignmentRepository.recordVote(
    caseId,
    jurorId,
    vote
  );
  if (!updated) {
    throw new ApiError(
      409,
      'CONFLICT',
      'You have already voted on this case.'
    );
  }

  await checkAndFinalize(caseId);

  return updated;
};
