import { z } from 'zod';
import { isValidObjectId } from '../../utils/validators.js';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../../core/api/api.constants.js';
import { BOOKMARKABLE_CONTENT_TYPES } from './bookmark.constants.js';

export const bookmarkContentTypeSchema = z.enum(BOOKMARKABLE_CONTENT_TYPES);

export const bookmarkToggleSchema = z.object({
  contentType: bookmarkContentTypeSchema,
  contentId: z.string().refine(isValidObjectId, {
    message: 'Invalid content ID.',
  }),
});

export const bookmarkStatusQuerySchema = z.object({
  contentType: bookmarkContentTypeSchema,
  contentIds: z.string().min(1),
});

export const bookmarkFeedQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
});
