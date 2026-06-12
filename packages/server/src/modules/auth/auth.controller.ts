import type { Request, Response } from 'express';
import { env } from '../../config/env.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import * as authService from './auth.service.js';
import { ApiError } from '../../utils/ApiError.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const registerLocal = asyncHandler(
  async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await authService.registerLocal(
      req.body
    );

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res
      .status(201)
      .json(
        new ApiResponse({ user, accessToken }, 'User registered successfully')
      );
  }
);

export const loginLocal = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.loginLocal(
    req.body
  );

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res
    .status(200)
    .json(new ApiResponse({ user, accessToken }, 'Login successful'));
});

export const refreshTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const incomingToken = req.cookies['refreshToken'];

    if (!incomingToken) {
      throw new ApiError(401, 'UNAUTHORIZED', 'No refresh token provided');
    }

    const { user, accessToken, refreshToken } =
      await authService.refreshAuthTokens(incomingToken);

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res
      .status(200)
      .json(new ApiResponse({ user, accessToken }, 'Tokens refreshed'));
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const incomingToken = req.cookies['refreshToken'];

  if (!incomingToken) {
    throw new ApiError(401, 'UNAUTHORIZED', 'No refresh token provided');
  }

  await authService.logoutUser(incomingToken);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json(new ApiResponse(null, 'Logged out successfully'));
});

export const requestEmailVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, 'BAD_REQUEST', 'Email is required');
    }

    await authService.sendVerificationEmail(email);

    res
      .status(200)
      .json(new ApiResponse(null, 'Verification code sent successfully'));
  }
);

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!otp) {
    throw new ApiError(400, 'BAD_REQUEST', 'OTP is required');
  }

  await authService.verifyEmailOtp(email, otp);

  res.status(200).json(new ApiResponse(null, 'Email verified successfully'));
});
