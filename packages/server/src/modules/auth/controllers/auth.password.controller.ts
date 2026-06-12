import type { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as passwordService from '../services/auth.password.service.js';
import { ApiError } from '../../../utils/ApiError.js';

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;

    const userId = req.user?.id || (req as any).userId;

    if (!userId) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Authentication required to change password'
      );
    }

    await passwordService.changePassword(userId, oldPassword, newPassword);

    res
      .status(200)
      .json(new ApiResponse(null, 'Password changed successfully'));
  }
);

export const requestPasswordReset = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    await passwordService.requestPasswordReset(email);

    res
      .status(200)
      .json(
        new ApiResponse(
          null,
          'If an account with this email exists, a reset code has been sent.'
        )
      );
  }
);

export const completePasswordReset = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    await passwordService.completePasswordReset(email, otp, newPassword);

    res
      .status(200)
      .json(
        new ApiResponse(
          null,
          'Password reset successfully. You can now log in.'
        )
      );
  }
);
