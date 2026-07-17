import { z } from 'zod';
import { UNIFIED_FEED_PAGE_SIZE } from '../constants/feed.constants.js';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../constants/api.constants.js';

const searchQueryString = z
  .string()
  .trim()
  .min(1, 'Search query cannot be empty.');

export const SEARCH_TYPES = ['video', 'short', 'post'] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

export const searchAllQuerySchema = z.object({
  q: searchQueryString,
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

export const searchTypeParamSchema = z.object({
  type: z.enum(SEARCH_TYPES, { message: 'Invalid search type.' }),
});

export const searchByTypeQuerySchema = z.object({
  q: searchQueryString,
  cursor: z.string().min(1, 'Cursor cannot be empty.').optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
});

export const searchCreatorsQuerySchema = z.object({
  q: searchQueryString,
  cursor: z.string().min(1, 'Cursor cannot be empty.').optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
});

export const searchSuggestionsQuerySchema = z.object({
  q: searchQueryString,
});
