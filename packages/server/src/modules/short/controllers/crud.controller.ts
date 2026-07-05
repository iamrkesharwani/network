import type { Request, Response } from 'express';
import type { ShortFeedQuery, ShortUpdateInput } from '@network/shared';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiPaginatedResponse } from '../../../utils/ApiPaginatedResponse.js';
import { ApiError } from '../../../utils/ApiError.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import {
  deleteShort,
  getMyShorts,
  getPublicFeed,
  getShortById,
  updateShort,
} from '../services/short.crud.service.js';

const getFeedQuery = (req: Request): ShortFeedQuery =>
  req.query as unknown as ShortFeedQuery;

const getShortIdParam = (req: Request): string =>
  req.params['shortId'] as string;

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getFeedQuery(req);
  const result = await getPublicFeed(page, limit);

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Feed fetched successfully'
      )
    );
});

export const getMine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { page, limit } = getFeedQuery(req);
  const result = await getMyShorts(req.user.id, page, limit);

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Your shorts fetched successfully'
      )
    );
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const short = await getShortById(getShortIdParam(req), req.user);

  res.status(200).json(new ApiResponse(short, 'Short fetched successfully'));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const short = await updateShort(
    getShortIdParam(req),
    req.user,
    req.body as ShortUpdateInput
  );

  res.status(200).json(new ApiResponse(short, 'Short updated successfully'));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  await deleteShort(getShortIdParam(req), req.user);

  res.status(200).json(new ApiResponse(null, 'Short deleted successfully'));
});
