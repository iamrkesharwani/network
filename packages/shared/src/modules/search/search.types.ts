import { z } from 'zod';
import {
  searchAllQuerySchema,
  searchByTypeQuerySchema,
  searchCreatorsQuerySchema,
  searchSuggestionsQuerySchema,
  searchTypeParamSchema,
  recentSearchAddSchema,
  recentSearchRemoveQuerySchema,
} from './search.schema.js';
import type { IMixedFeedBatch } from '../feed/feed.types.js';
import type { IPublicProfile } from '../user/user.types.js';
import type { IVideoResponse } from '../video/video.types.js';
import type { IShortResponse } from '../short/short.types.js';
import type { IPostResponse } from '../post/post.types.js';

export type SearchAllQuery = z.infer<typeof searchAllQuerySchema>;
export type SearchByTypeQuery = z.infer<typeof searchByTypeQuerySchema>;
export type SearchCreatorsQuery = z.infer<typeof searchCreatorsQuerySchema>;
export type SearchSuggestionsQuery = z.infer<
  typeof searchSuggestionsQuerySchema
>;
export type SearchTypeParam = z.infer<typeof searchTypeParamSchema>;
export type RecentSearchAddInput = z.infer<typeof recentSearchAddSchema>;
export type RecentSearchRemoveQuery = z.infer<
  typeof recentSearchRemoveQuerySchema
>;

export type ISearchAllResult = IMixedFeedBatch;

export interface ISearchSuggestions {
  creators: IPublicProfile[];
  videos: IVideoResponse[];
  shorts: IShortResponse[];
  posts: IPostResponse[];
}

export interface IRecentSearchesResponse {
  recent: string[];
}
