import type { Request, Response } from 'express';
import type { BlockListQuery } from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiPaginatedResponse } from '../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../core/utils/ApiError.js';
import {
  blockUser,
  unblockUser,
  listBlockedUsers,
} from './services/block.service.js';

export const blockUserHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    await blockUser(req.user.id, req.params['username'] as string);

    res.status(200).json(new ApiResponse(null, 'User blocked successfully'));
  }
);

export const unblockUserHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    await unblockUser(req.user.id, req.params['username'] as string);

    res.status(200).json(new ApiResponse(null, 'User unblocked successfully'));
  }
);

export const listBlockedUsersHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const { cursor, limit } = req.query as unknown as BlockListQuery;
    const result = await listBlockedUsers(req.user.id, cursor ?? null, limit);

    res
      .status(200)
      .json(
        new ApiPaginatedResponse(
          result.data,
          result.meta,
          'Blocked users fetched successfully'
        )
      );
  }
);
