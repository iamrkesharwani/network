import type { Request, Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import * as authVerifyService from '../services/auth.verify.service.js';

export const requestEmailVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
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
  await authVerifyService.verifyEmailOtp(email, otp);
  res.status(200).json(new ApiResponse(null, 'Email verified successfully'));
});
