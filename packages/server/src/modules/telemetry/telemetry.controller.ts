import type { Request, Response } from 'express';
import type { TelemetryProgressInput } from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiError } from '../../core/utils/ApiError.js';
import { recordWatchProgress } from './telemetry.service.js';

export const recordProgress = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const { videoId, currentTime } = req.body as TelemetryProgressInput;
    await recordWatchProgress(req.user.id, videoId, currentTime);

    res.status(200).json(new ApiResponse(null, 'Progress recorded'));
  }
);
