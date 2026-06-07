import type { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

interface ValidationSchemas {
  body?: ZodObject;
  query?: ZodObject;
  params?: ZodObject;
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
        req.query = (await schemas.query.parseAsync(req.query)) as any;
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as any;
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
        next(
          new ApiError(
            500,
            'INTERNAL_SERVER_ERROR',
            'Validation processing failed'
          )
        );
      }
    }
  };
};
