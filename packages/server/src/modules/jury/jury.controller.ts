import type { Request, Response } from 'express';
import type {
  JuryAppealCreateInput,
  JuryAppealResolveInput,
  JuryMineQuery,
  JuryVoteInput,
} from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiPaginatedResponse } from '../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../core/utils/ApiError.js';
import { castVote } from './services/jury.vote.service.js';
import {
  createAppeal,
  resolveAppealProcedurally,
} from './services/jury.appeal.service.js';
import {
  listAssignedForJuror,
  getCaseForViewer,
} from './services/jury.query.service.js';
import * as juryAppealRepository from './repository/jury-appeal.repository.js';
import { toAppealResponse, toVoteResponse } from './services/jury.mappers.js';

const getMineQuery = (req: Request): JuryMineQuery =>
  req.query as unknown as JuryMineQuery;

export const listAssigned = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const assigned = await listAssignedForJuror(req.user.id);

    res
      .status(200)
      .json(new ApiResponse(assigned, 'Assigned cases fetched successfully'));
  }
);

export const getCase = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { caseId } = req.params as { caseId: string };
  const result = await getCaseForViewer(caseId, req.user.id);

  res.status(200).json(new ApiResponse(result, 'Case fetched successfully'));
});

export const vote = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { caseId } = req.params as { caseId: string };
  const { vote: choice } = req.body as JuryVoteInput;

  const assignment = await castVote(caseId, req.user.id, choice);

  res
    .status(200)
    .json(new ApiResponse(toVoteResponse(assignment), 'Vote recorded successfully'));
});

export const createAppealHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const { caseId, reason } = req.body as JuryAppealCreateInput;
    const appeal = await createAppeal(caseId, req.user.id, reason);

    res
      .status(201)
      .json(
        new ApiResponse(toAppealResponse(appeal), 'Appeal submitted successfully')
      );
  }
);

export const listMyAppeals = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const { cursor, limit } = getMineQuery(req);
    const result = await juryAppealRepository.findByRequesterPaginated(
      req.user.id,
      cursor ?? null,
      limit
    );

    res
      .status(200)
      .json(
        new ApiPaginatedResponse(
          result.data.map(toAppealResponse),
          result.meta,
          'Appeals fetched successfully'
        )
      );
  }
);

export const resolveAppeal = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const { appealId } = req.params as { appealId: string };
    const { action, note } = req.body as JuryAppealResolveInput;

    const appeal = await resolveAppealProcedurally(
      appealId,
      req.user.id,
      action,
      note
    );

    res
      .status(200)
      .json(
        new ApiResponse(toAppealResponse(appeal), 'Appeal resolved successfully')
      );
  }
);
