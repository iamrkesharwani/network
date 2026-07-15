import { z } from 'zod';
import { UNIFIED_FEED_PAGE_SIZE } from '../constants/feed.constants.js';
import { MAX_PAGE_LIMIT } from '../constants/api.constants.js';

export const unifiedFeedQuerySchema = z.object({
  videoCursor: z.string().min(1, 'Cursor cannot be empty.').optional(),
  shortCursor: z.string().min(1, 'Cursor cannot be empty.').optional(),
  postCursor: z.string().min(1, 'Cursor cannot be empty.').optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(UNIFIED_FEED_PAGE_SIZE),
});
