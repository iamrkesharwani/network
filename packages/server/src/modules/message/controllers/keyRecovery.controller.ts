import type { Request, Response } from 'express';
import type { KeyRecoveryConfirmInput } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as keyRecoveryService from '../services/keyRecovery.service.js';

export const confirmRecovery = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const { recoveryToken } = req.body as KeyRecoveryConfirmInput;
    const result = await keyRecoveryService.confirmKeyRecovery(
      req.user.id,
      recoveryToken
    );

    res
      .status(200)
      .json(new ApiResponse(result, 'Messaging key recovered successfully'));
  }
);
