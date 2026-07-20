import { CONTENT_TYPES, ENGAGEABLE_CONTENT_TYPES } from './contentRef.constants.js';

export type ContentType = (typeof CONTENT_TYPES)[number];
export type EngageableContentType = (typeof ENGAGEABLE_CONTENT_TYPES)[number];

export const CONTENT_MODEL_BY_TYPE: Record<
  EngageableContentType,
  'Video' | 'Short' | 'Post' | 'Comment'
> = {
  video: 'Video',
  short: 'Short',
  post: 'Post',
  comment: 'Comment',
};
