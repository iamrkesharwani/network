import { z } from 'zod';
import { relatedFeedQuerySchema } from '../schemas/related.schema.js';
import type { ITypedPage } from './feed.types.js';
import type { IVideoResponse } from './video.types.js';
import type { IShortResponse } from './short.types.js';

export type RelatedFeedQuery = z.infer<typeof relatedFeedQuerySchema>;

export interface IRelatedFeedBatch {
  video: ITypedPage<IVideoResponse>;
  short: ITypedPage<IShortResponse>;
}
