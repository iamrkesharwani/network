import type { Request } from 'express';

export const getVideoIdParam = (req: Request): string =>
  req.params['videoId'] as string;

export const getUsernameParam = (req: Request): string =>
  req.params['username'] as string;

export const getCaptionIdParam = (req: Request): string =>
  req.params['captionId'] as string;
