import type { Request, Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import * as passwordService from '../services/auth.password.service.js';
import { ApiError } from '../../../core/utils/ApiError.js';

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Authentication required to change password'
      );
    }

    const { oldPassword, newPassword } = req.body;
    await passwordService.changePassword(req.user.id, oldPassword, newPassword);

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

export const requestAddPassword = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Authentication required to add a password'
      );
    }

    await passwordService.requestAddPassword(req.user.id);

    res
      .status(200)
      .json(new ApiResponse(null, 'Verification code sent to your email'));
  }
);

export const confirmAddPassword = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        401,
        'UNAUTHORIZED',
        'Authentication required to add a password'
      );
    }

    const { otp, newPassword } = req.body;
    const user = await passwordService.confirmAddPassword(
      req.user.id,
      otp,
      newPassword
    );

    res.status(200).json(new ApiResponse(user, 'Password added successfully'));
  }
);
