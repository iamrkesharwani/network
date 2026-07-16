import type { Request, Response } from 'express';
import type { CaptureLocationInput } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as userLocationService from '../services/user.location.service.js';

export const captureLocation = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const user = await userLocationService.captureLocation(
      req.user.id,
      req.body as CaptureLocationInput
    );

    res.status(200).json(new ApiResponse(user, 'Location captured'));
  }
);
