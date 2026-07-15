import { z } from 'zod';
import {
  searchAllQuerySchema,
  searchByTypeQuerySchema,
  searchCreatorsQuerySchema,
  searchTypeParamSchema,
} from '../schemas/search.schema.js';
import type { IMixedFeedBatch } from './feed.types.js';

export type SearchAllQuery = z.infer<typeof searchAllQuerySchema>;
export type SearchByTypeQuery = z.infer<typeof searchByTypeQuerySchema>;
export type SearchCreatorsQuery = z.infer<typeof searchCreatorsQuerySchema>;
export type SearchTypeParam = z.infer<typeof searchTypeParamSchema>;

export type ISearchAllResult = IMixedFeedBatch;
