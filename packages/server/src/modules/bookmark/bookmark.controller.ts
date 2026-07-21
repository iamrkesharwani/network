import type { Request, Response } from 'express';
import type { BookmarkFeedQuery, BookmarkToggleInput } from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiPaginatedResponse } from '../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../core/utils/ApiError.js';
import {
  toggleBookmark,
  getBookmarkStatuses,
  getBookmarks,
} from './bookmark.service.js';

const getFeedQuery = (req: Request): BookmarkFeedQuery =>
  req.query as unknown as BookmarkFeedQuery;

export const toggle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { contentType, contentId } = req.body as BookmarkToggleInput;
  const result = await toggleBookmark(req.user.id, contentType, contentId);

  res
    .status(200)
    .json(new ApiResponse(result, 'Bookmark toggled successfully'));
});

export const status = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { contentType, contentIds } = req.query as unknown as {
    contentType: BookmarkToggleInput['contentType'];
    contentIds: string;
  };

  const ids = contentIds
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const result = await getBookmarkStatuses(req.user.id, contentType, ids);

  res
    .status(200)
    .json(new ApiResponse(result, 'Bookmark statuses fetched successfully'));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { cursor, limit } = getFeedQuery(req);
  const result = await getBookmarks(req.user.id, cursor ?? null, limit);

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Bookmarks fetched successfully'
      )
    );
});
