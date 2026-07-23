import type {
  IJuryAppealResponse,
  IJuryAssignmentResponse,
  IJuryCaseResponse,
  IJuryVoteResponse,
  JuryVoteChoice,
} from '@network/shared';
import type { IJuryCaseDocument } from '../models/jury-case.model.js';
import type { IJuryAssignmentDocument } from '../models/jury-assignment.model.js';
import type { IJuryAppealDocument } from '../models/jury-appeal.model.js';
import type { IReportDocument } from '../../report/report.model.js';

export const toCaseResponse = (
  doc: IJuryCaseDocument,
  votesCast: number,
  report?: IReportDocument | null
): IJuryCaseResponse => ({
  id: doc._id.toString(),
  contentType: doc.contentType,
  contentId: doc.contentId.toString(),
  status: doc.status,
  ...(doc.verdict !== null && { verdict: doc.verdict }),
  votesCast,
  poolSize: doc.poolSize,
  deadline: doc.deadline.toISOString(),
  createdAt: doc.createdAt.toISOString(),
  ...(doc.resolvedAt !== null && {
    resolvedAt: doc.resolvedAt.toISOString(),
  }),
  ...(report?.disclosedContent && {
    disclosedContent: report.disclosedContent,
  }),
  ...(report?.note && { reporterNote: report.note }),
});

export const toAssignmentResponse = (
  doc: IJuryCaseDocument,
  votesCast: number,
  assignment: IJuryAssignmentDocument | null,
  report?: IReportDocument | null
): IJuryAssignmentResponse => ({
  ...toCaseResponse(doc, votesCast, report),
  ...(assignment?.vote != null && { myVote: assignment.vote }),
  ...(assignment?.votedAt != null && {
    votedAt: assignment.votedAt.toISOString(),
  }),
});

export const toVoteResponse = (
  doc: IJuryAssignmentDocument
): IJuryVoteResponse => ({
  id: doc._id.toString(),
  caseId: doc.caseId.toString(),
  vote: doc.vote as JuryVoteChoice,
  votedAt: (doc.votedAt as Date).toISOString(),
});

export const toAppealResponse = (
  doc: IJuryAppealDocument
): IJuryAppealResponse => ({
  id: doc._id.toString(),
  caseId: doc.caseId.toString(),
  status: doc.status,
  reason: doc.reason,
  createdAt: doc.createdAt.toISOString(),
  ...(doc.resolvedAt !== null && {
    resolvedAt: doc.resolvedAt.toISOString(),
  }),
});
