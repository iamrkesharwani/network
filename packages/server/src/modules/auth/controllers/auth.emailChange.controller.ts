import type { Request, Response } from 'express';
import type { ChangeEmailInput, ConfirmEmailChangeInput } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as emailChangeService from '../services/auth.emailChange.service.js';

export const requestEmailChange = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const { newEmail, password } = req.body as ChangeEmailInput;
    await emailChangeService.requestEmailChange(req.user.id, newEmail, password);

    res
      .status(200)
      .json(new ApiResponse(null, 'Verification codes sent to both emails'));
  }
);

export const confirmEmailChange = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const { oldEmailOtp, newEmailOtp } = req.body as ConfirmEmailChangeInput;
    const user = await emailChangeService.confirmEmailChange(
      req.user.id,
      oldEmailOtp,
      newEmailOtp
    );

    res.status(200).json(new ApiResponse(user, 'Email updated successfully'));
  }
);
