import { z } from 'zod';
import { unifiedFeedQuerySchema } from './feed.schema.js';
import type { CursorPaginationMeta } from '../../core/api/api.types.js';
import type { IVideoResponse } from '../video/video.types.js';
import type { IShortResponse } from '../short/short.types.js';
import type { IPostResponse } from '../post/post.types.js';

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
