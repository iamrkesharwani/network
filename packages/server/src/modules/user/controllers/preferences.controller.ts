import type { Request, Response } from 'express';
import type { UpdatePreferencesInput } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { updatePreferences } from '../services/user.preferences.service.js';

export const patchPreferences = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const preferences = await updatePreferences(
      req.user.id,
      req.body as UpdatePreferencesInput
    );

    res
      .status(200)
      .json(new ApiResponse(preferences, 'Preferences updated successfully'));
  }
);
