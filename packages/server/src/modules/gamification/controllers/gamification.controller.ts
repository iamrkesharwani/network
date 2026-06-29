import type { Request, Response } from 'express';
import { ACHIEVEMENT_CATALOG_LIST } from '@network/shared';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { ApiError } from '../../../utils/ApiError.js';
import * as gamificationService from '../gamification.service.js';

export const getMyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const profile = await gamificationService.getProfile(userId);

    res
      .status(200)
      .json(new ApiResponse(profile, 'Creator profile fetched successfully'));
  }
);

export const getCatalog = asyncHandler(async (_req: Request, res: Response) => {
  res
    .status(200)
    .json(
      new ApiResponse(
        ACHIEVEMENT_CATALOG_LIST,
        'Achievement catalog fetched successfully'
      )
    );
});
