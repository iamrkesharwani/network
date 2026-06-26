import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import * as Sentry from '@sentry/node';
import { ApiError } from '../utils/ApiError.js';
import type { ApiErrorResponse } from '@network/shared';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(err);
  }

  let error = err;

  if (error instanceof mongoose.Error.CastError) {
    error = new ApiError(
      400,
      'BAD_REQUEST',
      `Resource not found with id of ${error.value}`
    );
  }

  if (error.name === 'MongoServerError') {
    const mongoError = error as Error & {
      code: number;
      keyValue?: Record<string, unknown>;
    };

    if (mongoError.code === 11000) {
      const field = Object.keys(mongoError.keyValue || {})[0] || 'Field';
      error = new ApiError(409, 'CONFLICT', `${field} already exists.`);
    }
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const details: Record<string, string[]> = {};
    Object.values(error.errors).forEach((val) => {
      details[val.path] = [val.message];
    });
    error = new ApiError(
      400,
      'VALIDATION_ERROR',
      'Database validation failed',
      details
    );
  }

  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const errorCode =
    error instanceof ApiError ? error.code : 'INTERNAL_SERVER_ERROR';
  const message =
    error instanceof ApiError
      ? error.message
      : 'An unexpected error occurred on the server.';

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      ...(error instanceof ApiError &&
        error.details && { details: error.details }),
    },
  };

  if (env.NODE_ENV === 'development') {
    (response.error as any).stack = error.stack;
  }

  if (statusCode >= 500) {
    logger.error(error);
    Sentry.captureException(error);
  } else {
    logger.warn(`[${errorCode}] ${message}`);
  }

  res.status(statusCode).json(response);
};
