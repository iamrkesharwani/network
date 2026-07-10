import type { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';

export const sanitizeMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);

  if (req.query) {
    const sanitizedQuery = mongoSanitize.sanitize({ ...req.query });
    Object.defineProperty(req, 'query', {
      value: sanitizedQuery,
      configurable: true,
      enumerable: true,
      writable: true,
    });
  }

  next();
};
