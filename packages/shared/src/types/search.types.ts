import { z } from 'zod';
import {
  searchQuerySchema,
  SEARCH_TYPES,
  SEARCH_DURATIONS,
  SEARCH_DATES,
  SEARCH_SORTS,
} from '../schemas/search.schema.js';

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type SearchType = (typeof SEARCH_TYPES)[number];
export type SearchDuration = (typeof SEARCH_DURATIONS)[number];
export type SearchDateRange = (typeof SEARCH_DATES)[number];
export type SearchSort = (typeof SEARCH_SORTS)[number];
