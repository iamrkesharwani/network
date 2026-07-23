import type { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiError } from '../../core/utils/ApiError.js';
import { blockUser, unblockUser } from './services/block.service.js';

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
