import { z } from 'zod';
import { isValidObjectId } from '../../utils/validators.js';
import { HISTORY_CONTENT_TYPES } from './history.constants.js';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../../core/api/api.constants.js';

export const historyContentTypeSchema = z.enum(HISTORY_CONTENT_TYPES);

export const historyProgressSchema = z.object({
  contentType: historyContentTypeSchema,
  contentId: z.string().refine(isValidObjectId, {
    message: 'Invalid content ID.',
  }),
  currentTime: z.number().min(0),
  duration: z.number().min(0).optional(),
});

export const historyContentParamSchema = z.object({
  contentType: historyContentTypeSchema,
  contentId: z.string().refine(isValidObjectId, {
    message: 'Invalid content ID.',
  }),
});

export const historyIdParamSchema = z.object({
  historyId: z.string().refine(isValidObjectId, {
    message: 'Invalid history ID.',
  }),
});

export const historyFeedQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
});
