import type { Request, Response } from 'express';
import type { UnifiedFeedQuery } from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiPaginatedResponse } from '../../core/utils/ApiPaginatedResponse.js';
import { getUnifiedFeed } from './feed.service.js';

const getFeedQuery = (req: Request): UnifiedFeedQuery =>
  req.query as unknown as UnifiedFeedQuery;

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const { cursor, limit } = getFeedQuery(req);
  const result = await getUnifiedFeed(cursor, limit);

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
