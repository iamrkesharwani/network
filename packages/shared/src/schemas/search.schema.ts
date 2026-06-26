import { z } from 'zod';
import { VIDEO_CATEGORIES } from '../constants/video.constants.js';

export const SEARCH_TYPES = ['video', 'short', 'user', 'playlist'] as const;
export const SEARCH_DURATIONS = ['short', 'medium', 'long'] as const;
export const SEARCH_DATES = ['today', 'week', 'month', 'year', 'all'] as const;
export const SEARCH_SORTS = ['relevance', 'date', 'views', 'rating'] as const;

export const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, { message: 'Search query cannot be empty.' })
    .optional(),

  type: z.enum(SEARCH_TYPES).default('video'),

  category: z.enum(VIDEO_CATEGORIES).optional(),

  duration: z.enum(SEARCH_DURATIONS).optional(),

  dateRange: z.enum(SEARCH_DATES).default('all'),

  sort: z.enum(SEARCH_SORTS).default('relevance'),

  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(50).default(20),
});
