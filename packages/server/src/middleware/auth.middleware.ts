import type { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(
        new ApiError(401, 'UNAUTHORIZED', 'Access denied. No token provided.')
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(
        new ApiError(401, 'UNAUTHORIZED', 'Access denied. Token missing.')
      );
    }

    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub) {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Invalid token payload.'));
    }

    req.user = {
      id: payload.sub,
      role: (payload['role'] as string) || 'user',
    };

    next();
  } catch (error: any) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Token expired.'));
    }
    return next(new ApiError(401, 'UNAUTHORIZED', 'Invalid token.'));
  }
};
