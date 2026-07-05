import type { Request, Response, NextFunction } from 'express';

export const rawWebhookBody = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const buf = req.body as Buffer;
  req.rawBody = buf;

  if (buf && buf.length > 0) {
    try {
      req.body = JSON.parse(buf.toString('utf-8'));
    } catch {
      req.body = {};
    }
  } else {
    req.body = {};
  }

  next();
};
