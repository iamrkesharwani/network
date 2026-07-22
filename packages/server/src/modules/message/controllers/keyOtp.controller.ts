import type { Request, Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as keyOtpService from '../services/keyOtp.service.js';

export const requestOtp = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    await keyOtpService.requestKeyOtp(req.user.id);

    res
      .status(200)
      .json(new ApiResponse(null, 'Verification code sent to your email'));
  }
);

export const confirmOtp = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const { otp } = req.body as { otp: string };
    await keyOtpService.confirmKeyOtp(req.user.id, otp);

    res.status(200).json(new ApiResponse(null, 'Identity verified'));
  }
);
