import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { env } from '../config/env.js';

export const generateCsrfToken = (_req: Request, res: Response) => {
  const token = crypto.randomBytes(32).toString('hex');

  res.cookie('_csrf', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 15 * 60 * 1000,
  });

  res
    .status(200)
    .json(new ApiResponse({ csrfToken: token }, 'CSRF token generated'));
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

  const cookieToken = req.cookies['_csrf'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || Array.isArray(headerToken)) {
    return next(
      new ApiError(403, 'FORBIDDEN', 'Invalid or missing CSRF token')
    );
  }

  const cookieBuf = Buffer.from(cookieToken as string);
  const headerBuf = Buffer.from(headerToken);

  if (
    cookieBuf.length !== headerBuf.length ||
    !crypto.timingSafeEqual(cookieBuf, headerBuf)
  ) {
    return next(
      new ApiError(403, 'FORBIDDEN', 'Invalid or missing CSRF token')
    );
  }

  next();
};
