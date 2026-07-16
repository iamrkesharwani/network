import type { Request, Response } from 'express';
import type { PreferencesPatchInput } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as preferencesService from '../preferences.service.js';

export const getPreferences = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const preferences = await preferencesService.getPreferences(req.user.id);

    res
      .status(200)
      .json(new ApiResponse(preferences, 'Preferences fetched successfully'));
  }
);

export const patchPreferences = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const preferences = await preferencesService.updatePreferences(
      req.user.id,
      req.body as PreferencesPatchInput
    );

    res
      .status(200)
      .json(new ApiResponse(preferences, 'Preferences updated successfully'));
  }
);
