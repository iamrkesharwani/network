import { z } from 'zod';
import {
  juryVoteSchema,
  juryAppealCreateSchema,
  juryAppealResolveSchema,
  juryMineQuerySchema,
  juryContentParamSchema,
} from '../schemas/jury.schema.js';
import type {
  JuryCaseStatus,
  JuryVerdict,
  JuryVoteChoice,
  AppealStatus,
} from '../constants/jury.constants.js';
import type { ReportableContentType } from './report.types.js';

export type JuryVoteInput = z.infer<typeof juryVoteSchema>;
export type JuryAppealCreateInput = z.infer<typeof juryAppealCreateSchema>;
export type JuryAppealResolveInput = z.infer<typeof juryAppealResolveSchema>;
export type JuryMineQuery = z.infer<typeof juryMineQuerySchema>;
export type JuryContentParam = z.infer<typeof juryContentParamSchema>;

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
