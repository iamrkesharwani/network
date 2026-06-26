import type { Request, Response } from 'express';
import { env } from '../../../config/env.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import * as authCoreService from '../services/auth.core.service.js';
import { ApiError } from '../../../utils/ApiError.js';
import { setCsrfCookie } from '../../../middleware/csrf.middleware.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: env.REFRESH_TOKEN_COOKIE_MS,
};

export const registerLocal = asyncHandler(
  async (req: Request, res: Response) => {
    const { user } = await authCoreService.registerLocal(req.body);
    res
      .status(201)
      .json(
        new ApiResponse(
          { userId: user.id },
          'Account created. Please check your email to verify your account.'
        )
      );
  }
);

export const loginLocal = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authCoreService.loginLocal(
    req.body
  );

  res.cookie('refreshToken', refreshToken, cookieOptions);

  setCsrfCookie(res);

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
      await authCoreService.refreshAuthTokens(incomingToken);

    res.cookie('refreshToken', refreshToken, cookieOptions);

    setCsrfCookie(res);

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

  await authCoreService.logoutUser(incomingToken);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json(new ApiResponse(null, 'Logged out successfully'));
});
