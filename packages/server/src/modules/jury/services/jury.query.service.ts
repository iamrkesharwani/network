import type { IJuryAssignmentResponse } from '@network/shared';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as juryCaseRepository from '../repository/jury-case.repository.js';
import * as juryAssignmentRepository from '../repository/jury-assignment.repository.js';
import { toAssignmentResponse } from './jury.mappers.js';

export const listAssignedForJuror = async (
  jurorId: string
): Promise<IJuryAssignmentResponse[]> => {
  const assignments =
    await juryAssignmentRepository.findOpenAssignmentsForJuror(jurorId);

  const responses: IJuryAssignmentResponse[] = [];
  for (const assignment of assignments) {
    const juryCase = await juryCaseRepository.findById(
      assignment.caseId.toString()
    );
    if (!juryCase) continue;

    const counts = await juryAssignmentRepository.countVotes(
      juryCase._id.toString()
    );
    responses.push(toAssignmentResponse(juryCase, counts.total, assignment));
  }

  return responses;
};

export const getCaseForViewer = async (
  caseId: string,
  viewerId: string
): Promise<IJuryAssignmentResponse> => {
  const juryCase = await juryCaseRepository.findById(caseId);
  if (!juryCase) {
    throw new ApiError(404, 'NOT_FOUND', 'Jury case not found.');
  }

  const assignment = await juryAssignmentRepository.findForCaseAndJuror(
    caseId,
    viewerId
  );
  if (!assignment) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'You are not assigned to this case.'
    );
  }

  const counts = await juryAssignmentRepository.countVotes(caseId);
  return toAssignmentResponse(juryCase, counts.total, assignment);
};
