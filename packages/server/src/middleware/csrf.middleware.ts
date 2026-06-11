import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const generateCsrfToken = (_req: Request, res: Response) => {
  const token = crypto.randomBytes(32).toString('hex');

  res.cookie('_csrf', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  res.status(200).json({
    success: true,
    data: { csrfToken: token },
  });
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

  const cookieToken = req.cookies?._csrf;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(
      new ApiError(403, 'FORBIDDEN', 'Invalid or missing CSRF token')
    );
  }

  next();
};
