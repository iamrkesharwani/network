import { z } from 'zod';
import {
  bookmarkContentTypeSchema,
  bookmarkToggleSchema,
  bookmarkStatusQuerySchema,
  bookmarkFeedQuerySchema,
} from './bookmark.schema.js';
import { BOOKMARKABLE_CONTENT_TYPES } from './bookmark.constants.js';

export type BookmarkableContentType = (typeof BOOKMARKABLE_CONTENT_TYPES)[number];
export type BookmarkContentTypeInput = z.infer<typeof bookmarkContentTypeSchema>;
export type BookmarkToggleInput = z.infer<typeof bookmarkToggleSchema>;
export type BookmarkStatusQuery = z.infer<typeof bookmarkStatusQuerySchema>;
export type BookmarkFeedQuery = z.infer<typeof bookmarkFeedQuerySchema>;

export interface IBookmarkToggleResponse {
  bookmarked: boolean;
}

export interface IBookmarkContentSummary {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration?: number;
}

export interface IBookmarkResponse {
  id: string;
  contentType: BookmarkableContentType;
  content: IBookmarkContentSummary;
  savedAt: string;
}
