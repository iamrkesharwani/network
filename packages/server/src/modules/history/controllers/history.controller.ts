import type { Request, Response } from 'express';
import type { HistoryFeedQuery, HistoryProgressInput } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiPaginatedResponse } from '../../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { bufferProgress } from '../services/history.progress.service.js';
import {
  getHistory,
  getResumePoint,
  removeEntry,
  clearHistory,
} from '../services/history.crud.service.js';
import {
  getHistoryIdParam,
  getContentTypeParam,
  getContentIdParam,
} from './params.js';

const getFeedQuery = (req: Request): HistoryFeedQuery =>
  req.query as unknown as HistoryFeedQuery;

export const recordProgress = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const { contentType, contentId, currentTime, duration } =
      req.body as HistoryProgressInput;
    await bufferProgress(
      req.user.id,
      contentType,
      contentId,
      currentTime,
      duration
    );

    res.status(200).json(new ApiResponse(null, 'Progress recorded'));
  }
);

export const list = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { cursor, limit } = getFeedQuery(req);
  const result = await getHistory(req.user.id, cursor ?? null, limit);

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Watch history fetched successfully'
      )
    );
});

export const getResume = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const resume = await getResumePoint(
    req.user.id,
    getContentTypeParam(req),
    getContentIdParam(req)
  );

  res
    .status(200)
    .json(new ApiResponse(resume, 'Resume point fetched successfully'));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  await removeEntry(getHistoryIdParam(req), req.user);

  res
    .status(200)
    .json(new ApiResponse(null, 'History entry deleted successfully'));
});

export const clear = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  await clearHistory(req.user.id);

  res
    .status(200)
    .json(new ApiResponse(null, 'Watch history cleared successfully'));
});
