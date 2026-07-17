import { z } from 'zod';
import {
  juryVoteSchema,
  juryAppealCreateSchema,
  juryAppealResolveSchema,
  juryMineQuerySchema,
  juryContentParamSchema,
} from './jury.schema.js';
import type {
  APPEAL_STATUS,
  JURY_CASE_STATUS,
  JURY_VERDICT,
  JURY_VOTE_CHOICES,
} from './jury.constants.js';
import type { ReportableContentType } from '../report/report.types.js';

export type JuryVoteInput = z.infer<typeof juryVoteSchema>;
export type JuryAppealCreateInput = z.infer<typeof juryAppealCreateSchema>;
export type JuryAppealResolveInput = z.infer<typeof juryAppealResolveSchema>;
export type JuryMineQuery = z.infer<typeof juryMineQuerySchema>;
export type JuryContentParam = z.infer<typeof juryContentParamSchema>;
export type JuryCaseStatus = (typeof JURY_CASE_STATUS)[number];
export type JuryVerdict = (typeof JURY_VERDICT)[number];
export type JuryVoteChoice = (typeof JURY_VOTE_CHOICES)[number];
export type AppealStatus = (typeof APPEAL_STATUS)[number];

export interface IJuryCaseResponse {
  id: string;
  contentType: ReportableContentType;
  contentId: string;
  status: JuryCaseStatus;
  verdict?: JuryVerdict;
  votesCast: number;
  poolSize: number;
  deadline: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface IJuryVoteResponse {
  id: string;
  caseId: string;
  vote: JuryVoteChoice;
  votedAt: string;
}

export interface IJuryAssignmentResponse extends IJuryCaseResponse {
  myVote?: JuryVoteChoice;
  votedAt?: string;
}

export interface IJuryAppealResponse {
  id: string;
  caseId: string;
  status: AppealStatus;
  reason: string;
  createdAt: string;
  resolvedAt?: string;
}
