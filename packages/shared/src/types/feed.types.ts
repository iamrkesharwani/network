import { z } from 'zod';
import { unifiedFeedQuerySchema } from '../schemas/feed.schema.js';
import type { CursorPaginationMeta } from './api.types.js';
import type { IVideoResponse } from './video.types.js';
import type { IShortResponse } from './short.types.js';
import type { IPostResponse } from './post.types.js';

export type UnifiedFeedQuery = z.infer<typeof unifiedFeedQuerySchema>;

export type IFeedItem =
  | { type: 'video'; item: IVideoResponse }
  | { type: 'short'; item: IShortResponse }
  | { type: 'post'; item: IPostResponse };

export interface ITypedPage<T> {
  data: T[];
  meta: CursorPaginationMeta;
}

export interface IMixedFeedBatch {
  video: ITypedPage<IVideoResponse>;
  short: ITypedPage<IShortResponse>;
  post: ITypedPage<IPostResponse>;
}
