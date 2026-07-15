import { z } from 'zod';
import {
  historyProgressSchema,
  historyContentParamSchema,
  historyIdParamSchema,
  historyFeedQuerySchema,
} from '../schemas/history.schema.js';
import { HISTORY_CONTENT_TYPES } from '../constants/history.constants.js';

export type HistoryContentType = (typeof HISTORY_CONTENT_TYPES)[number];
export type HistoryProgressInput = z.infer<typeof historyProgressSchema>;
export type HistoryContentParam = z.infer<typeof historyContentParamSchema>;
export type HistoryIdParam = z.infer<typeof historyIdParamSchema>;
export type HistoryFeedQuery = z.infer<typeof historyFeedQuerySchema>;

export interface IHistoryContentSummary {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration: number;
}

export interface IHistoryResponse {
  id: string;
  contentType: HistoryContentType;
  content: IHistoryContentSummary;
  currentTime: number;
  duration?: number;
  progressPercent: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface IHistoryResumeResponse {
  currentTime: number;
  duration?: number;
  completed: boolean;
}
