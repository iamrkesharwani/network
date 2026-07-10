import type { Request, Response } from 'express';
import {
  BADGE_CATALOG,
  VIDEO_MILESTONE_CATALOG,
  CREATOR_MILESTONE_CATALOG,
} from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiError } from '../../core/utils/ApiError.js';
import { getProfile } from './services/creator.profile.service.js';
import { getPublicProfile } from '../user/services/user.profile.service.js';

export const getMyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const profile = await getProfile(userId);

    res
      .status(200)
      .json(new ApiResponse(profile, 'Creator profile fetched successfully'));
  }
);

export const getPublicProfileByUsername = asyncHandler(
  async (req: Request, res: Response) => {
    const username = req.params['username'] as string;
    const profile = await getPublicProfile(username);

    res
      .status(200)
      .json(new ApiResponse(profile, 'Public profile fetched successfully'));
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
