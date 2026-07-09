import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { env } from '../env/env.js';
import {
  CSRF_EXEMPT_PATHS,
  CSRF_COOKIE_NAME,
  FIFTEEN_MINUTES_MS,
} from '@network/shared';

export const setCsrfCookie = (res: Response) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: FIFTEEN_MINUTES_MS,
  });
};

export const generateCsrfToken = (_req: Request, res: Response) => {
  setCsrfCookie(res);
  res.status(200).json(new ApiResponse(null, 'CSRF token generated'));
};

export const validateCsrfToken = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  if (req.originalUrl.includes('/webhook')) {
    return next();
  }

  if (CSRF_EXEMPT_PATHS.some((path) => req.path === path)) {
    return next();
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || Array.isArray(headerToken)) {
    return next(
      new ApiError(403, 'FORBIDDEN', 'Invalid or missing CSRF token')
    );
  }

  try {
    const cookieBuf = Buffer.from(cookieToken as string, 'hex');
    const headerBuf = Buffer.from(headerToken, 'hex');

    if (
      cookieBuf.length !== 32 ||
      headerBuf.length !== 32 ||
      !crypto.timingSafeEqual(cookieBuf, headerBuf)
    ) {
      return next(
        new ApiError(403, 'FORBIDDEN', 'Invalid CSRF token mismatch')
      );
    }

    next();
  } catch (error) {
    return next(new ApiError(403, 'FORBIDDEN', 'Malformed CSRF token'));
  }
};
