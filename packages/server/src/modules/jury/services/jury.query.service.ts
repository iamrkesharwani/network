import type {
  IJuryAssignmentResponse,
  IJuryCaseResponse,
  ReportableContentType,
} from '@network/shared';
import { ApiError } from '../../../core/utils/ApiError.js';
import { getModerationContentAdapter } from '../../../core/moderation/moderationContent.registry.js';
import * as juryCaseRepository from '../repository/jury-case.repository.js';
import * as juryAssignmentRepository from '../repository/jury-assignment.repository.js';
import { toAssignmentResponse, toCaseResponse } from './jury.mappers.js';

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

export const getCaseForContentOwner = async (
  contentType: ReportableContentType,
  contentId: string,
  viewerId: string
): Promise<IJuryCaseResponse | null> => {
  const adapter = getModerationContentAdapter(contentType);
  const lookup = adapter ? await adapter.lookup(contentId) : null;

  if (!lookup?.exists || lookup.ownerId !== viewerId) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not own this content.');
  }

  const juryCase = await juryCaseRepository.findLatestResolvedCaseForContent(
    contentType,
    contentId
  );
  if (!juryCase) return null;

  const counts = await juryAssignmentRepository.countVotes(
    juryCase._id.toString()
  );
  return toCaseResponse(juryCase, counts.total);
};
