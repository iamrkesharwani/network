import type { Request, Response } from 'express';
import type {
  SearchAllQuery,
  SearchByTypeQuery,
  SearchCreatorsQuery,
  SearchSuggestionsQuery,
  SearchTypeParam,
  RecentSearchAddInput,
  RecentSearchRemoveQuery,
} from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiPaginatedResponse } from '../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../core/utils/ApiError.js';
import * as searchService from './search.service.js';
import * as searchRecentService from './search.recent.service.js';

const requireUserId = (req: Request): string => {
  const userId = req.user?.id;
  if (!userId)
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  return userId;
};

export const getSearchAll = asyncHandler(
  async (req: Request, res: Response) => {
    const { q, videoCursor, shortCursor, postCursor, limit } =
      req.query as unknown as SearchAllQuery;

    const result = await searchService.searchAll(
      q,
      { videoCursor, shortCursor, postCursor },
      limit
    );

    res
      .status(200)
      .json(new ApiResponse(result, 'Search results fetched successfully'));
  }
);

export const getSearchByType = asyncHandler(
  async (req: Request, res: Response) => {
    const { type } = req.params as unknown as SearchTypeParam;
    const { q, cursor, limit } = req.query as unknown as SearchByTypeQuery;

    const result = await searchService.searchByType(
      q,
      type,
      cursor ?? null,
      limit
    );

    res
      .status(200)
      .json(
        new ApiPaginatedResponse(
          result.data,
          result.meta,
          'Search results fetched successfully'
        )
      );
  }
);

export const getSearchCreators = asyncHandler(
  async (req: Request, res: Response) => {
    const { q, cursor, limit } = req.query as unknown as SearchCreatorsQuery;
    const result = await searchService.searchCreators(q, cursor ?? null, limit);

    res
      .status(200)
      .json(
        new ApiPaginatedResponse(
          result.data,
          result.meta,
          'Creators fetched successfully'
        )
      );
  }
);

export const getSearchSuggestions = asyncHandler(
  async (req: Request, res: Response) => {
    const { q } = req.query as unknown as SearchSuggestionsQuery;
    const result = await searchService.searchSuggestions(q);

    res
      .status(200)
      .json(new ApiResponse(result, 'Search suggestions fetched successfully'));
  }
);

export const getRecentSearches = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const recent = await searchRecentService.getRecentSearches(userId);

    res
      .status(200)
      .json(
        new ApiResponse({ recent }, 'Recent searches fetched successfully')
      );
  }
);

export const addRecentSearch = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const { q } = req.body as RecentSearchAddInput;
    const recent = await searchRecentService.addRecentSearch(userId, q);

    res
      .status(200)
      .json(new ApiResponse({ recent }, 'Recent search added successfully'));
  }
);

export const removeRecentSearch = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = requireUserId(req);
    const { q } = req.query as unknown as RecentSearchRemoveQuery;

    const recent = q
      ? await searchRecentService.removeRecentSearch(userId, q)
      : await searchRecentService
          .clearRecentSearches(userId)
          .then(() => [] as string[]);

    res
      .status(200)
      .json(
        new ApiResponse({ recent }, 'Recent searches updated successfully')
      );
  }
);
