import type { Request, Response } from 'express';
import type {
  SearchAllQuery,
  SearchByTypeQuery,
  SearchCreatorsQuery,
  SearchTypeParam,
} from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiPaginatedResponse } from '../../core/utils/ApiPaginatedResponse.js';
import * as searchService from './search.service.js';

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
