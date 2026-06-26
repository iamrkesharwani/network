import type { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

const JWT_SECRET_BUFFER = new TextEncoder().encode(env.JWT_SECRET);

const verifyAccessToken = async (
  token: string
): Promise<{ id: string; role: string }> => {
  const { payload } = await jwtVerify(token, JWT_SECRET_BUFFER);

  if (!payload.sub) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid token payload.');
  }

  return {
    id: payload.sub,
    role: (payload['role'] as string) || 'user',
  };
};

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

    req.user = await verifyAccessToken(token);

    next();
  } catch (error: any) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return next(new ApiError(401, 'UNAUTHORIZED', 'Token expired.'));
    }
    return next(new ApiError(401, 'UNAUTHORIZED', 'Invalid token.'));
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    req.user = await verifyAccessToken(token);
  } catch {
    delete req.user;
  }
  return next();
};
