import type { Request, Response } from 'express';
import type { ReportCreateInput, ReportMineQuery } from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiPaginatedResponse } from '../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../core/utils/ApiError.js';
import { createReport, getMyReports } from './services/report.crud.service.js';

const getMineQuery = (req: Request): ReportMineQuery =>
  req.query as unknown as ReportMineQuery;

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { contentType, contentId, reasonCode, note } =
    req.body as ReportCreateInput;
    
  const report = await createReport(
    req.user.id,
    contentType,
    contentId,
    reasonCode,
    note
  );

  res
    .status(201)
    .json(new ApiResponse(report, 'Report submitted successfully'));
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { cursor, limit } = getMineQuery(req);
  const result = await getMyReports(req.user.id, cursor ?? null, limit);

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Reports fetched successfully'
      )
    );
});
