import { z } from 'zod';
import { RELATED_FEED_PAGE_SIZE } from '../constants/related.constants.js';
import { MAX_PAGE_LIMIT } from '../constants/api.constants.js';

export const relatedFeedQuerySchema = z.object({
  videoCursor: z.string().min(1, 'Cursor cannot be empty.').optional(),
  shortCursor: z.string().min(1, 'Cursor cannot be empty.').optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(RELATED_FEED_PAGE_SIZE),
});
