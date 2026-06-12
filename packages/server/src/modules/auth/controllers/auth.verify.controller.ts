import type { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as authVerifyService from '../services/auth.verify.controller.js';
import { ApiError } from '../../../utils/ApiError.js';

export const requestEmailVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, 'BAD_REQUEST', 'Email is required');
    }

    await authVerifyService.sendVerificationEmail(email);

    res
      .status(200)
      .json(
        new ApiResponse(
          null,
          'If an account with this email exists and is unverified, a code has been sent.'
        )
      );
  }
);

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, 'BAD_REQUEST', 'Email and OTP are required');
  }

  await authVerifyService.verifyEmailOtp(email, otp);

  res.status(200).json(new ApiResponse(null, 'Email verified successfully'));
});
