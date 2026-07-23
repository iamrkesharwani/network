import type { Request, Response } from 'express';
import type { UnifiedFeedQuery } from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { getUnifiedFeed } from './feed.service.js';

const getFeedQuery = (req: Request): UnifiedFeedQuery =>
  req.query as unknown as UnifiedFeedQuery;

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const { videoCursor, shortCursor, postCursor, limit } = getFeedQuery(req);
  const result = await getUnifiedFeed(
    { videoCursor, shortCursor, postCursor },
    limit,
    req.user?.id
  );

  res.status(200).json(new ApiResponse(result, 'Feed fetched successfully'));
});
