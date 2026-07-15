import type { Request } from 'express';
import type { HistoryContentType } from '@network/shared';

export const getHistoryIdParam = (req: Request): string =>
  req.params['historyId'] as string;

export const getContentTypeParam = (req: Request): HistoryContentType =>
  req.params['contentType'] as HistoryContentType;

export const getContentIdParam = (req: Request): string =>
  req.params['contentId'] as string;
