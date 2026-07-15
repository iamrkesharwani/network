import type { Request, Response } from 'express';
import type { RelatedFeedQuery } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { getRelatedFeed } from '../services/video.related.service.js';
import { getVideoIdParam } from './params.js';

const getRelatedQuery = (req: Request): RelatedFeedQuery =>
  req.query as unknown as RelatedFeedQuery;

export const getRelated = asyncHandler(
  async (req: Request, res: Response) => {
    const { videoCursor, shortCursor, limit } = getRelatedQuery(req);
    const result = await getRelatedFeed(
      getVideoIdParam(req),
      { videoCursor, shortCursor },
      limit
    );

    res
      .status(200)
      .json(new ApiResponse(result, 'Related content fetched successfully'));
  }
);
