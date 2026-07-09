import type { Request, Response, NextFunction } from 'express';
import { type ZodType, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

interface ValidationSchemas {
  body?: ZodType<unknown>;
  query?: ZodType<unknown>;
  params?: ZodType<unknown>;
}

export const validate = (schemas: ValidationSchemas) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        const parsedQuery = await schemas.query.parseAsync(req.query);
        
        Object.defineProperty(req, 'query', {
          value: parsedQuery,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(
          req.params
        )) as unknown as typeof req.params;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};

        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          if (!details[path]) {
            details[path] = [];
          }
          details[path].push(issue.message);
        });

        next(
          new ApiError(400, 'VALIDATION_ERROR', 'Invalid request data', details)
        );
      } else {
        logger.error(
          {
            err: error,
            method: req.method,
            path: req.originalUrl,
          },
          'Unexpected error during request validation'
        );

        next(
          new ApiError(
            500,
            'INTERNAL_SERVER_ERROR',
            'Validation processing failed',
            undefined,
            true,
            error instanceof Error ? error.stack : undefined
          )
        );
      }
    }
  };
};
