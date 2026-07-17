import { z } from 'zod';
import { relatedFeedQuerySchema } from './related.schema.js';
import type { ITypedPage } from '../feed/feed.types.js';
import type { IVideoResponse } from '../video/video.types.js';
import type { IShortResponse } from '../short/short.types.js';

export type RelatedFeedQuery = z.infer<typeof relatedFeedQuerySchema>;

export interface IRelatedFeedBatch {
  video: ITypedPage<IVideoResponse>;
  short: ITypedPage<IShortResponse>;
}
