import { z } from 'zod';
import { unifiedFeedQuerySchema } from '../schemas/feed.schema.js';
import type { IVideoResponse } from './video.types.js';
import type { IPostResponse } from './post.types.js';

export type UnifiedFeedQuery = z.infer<typeof unifiedFeedQuerySchema>;

export type IFeedItem =
  | { type: 'video'; item: IVideoResponse }
  | { type: 'post'; item: IPostResponse };
