import type { Request, Response } from 'express';
import {
  BADGE_CATALOG,
  VIDEO_MILESTONE_CATALOG,
  CREATOR_MILESTONE_CATALOG,
} from '@network/shared';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import * as creatorService from './creator.service.js';

export const getMyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const profile = await creatorService.getProfile(userId);

    res
      .status(200)
      .json(new ApiResponse(profile, 'Creator profile fetched successfully'));
  }
);

export const getCatalog = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json(
    new ApiResponse(
      {
        badges: BADGE_CATALOG,
        videoMilestones: VIDEO_MILESTONE_CATALOG,
        creatorMilestones: CREATOR_MILESTONE_CATALOG,
      },
      'Creator catalog fetched successfully'
    )
  );
});
