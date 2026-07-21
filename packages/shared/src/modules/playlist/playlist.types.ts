import { z } from 'zod';
import {
  playlistContentTypeSchema,
  playlistCreateSchema,
  playlistUpdateSchema,
  playlistIdParamSchema,
  playlistItemAddSchema,
  playlistItemIdParamSchema,
  playlistReorderSchema,
  playlistFeedQuerySchema,
  playlistItemsQuerySchema,
  playlistContainingQuerySchema,
} from './playlist.schema.js';
import { PLAYLIST_CONTENT_TYPES } from './playlist.constants.js';
import type { ContentVisibility } from '../general/types/general.types.js';

export type PlaylistContentType = (typeof PLAYLIST_CONTENT_TYPES)[number];
export type PlaylistContentTypeInput = z.infer<typeof playlistContentTypeSchema>;
export type PlaylistCreateInput = z.infer<typeof playlistCreateSchema>;
export type PlaylistUpdateInput = z.infer<typeof playlistUpdateSchema>;
export type PlaylistIdParam = z.infer<typeof playlistIdParamSchema>;
export type PlaylistItemAddInput = z.infer<typeof playlistItemAddSchema>;
export type PlaylistItemIdParam = z.infer<typeof playlistItemIdParamSchema>;
export type PlaylistReorderInput = z.infer<typeof playlistReorderSchema>;
export type PlaylistFeedQuery = z.infer<typeof playlistFeedQuerySchema>;
export type PlaylistItemsQuery = z.infer<typeof playlistItemsQuerySchema>;
export type PlaylistContainingQuery = z.infer<
  typeof playlistContainingQuerySchema
>;

export interface IPlaylistContentSummary {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration: number;
}

export interface IPlaylistSummary {
  id: string;
  title: string;
  description?: string;
  visibility: ContentVisibility;
  itemCount: number;
  thumbnailUrl?: string;
  hasCustomCover: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IPlaylistAuthor {
  id: string;
  username: string;
}

export interface IPlaylistDetail extends IPlaylistSummary {
  userId: string;
  author: IPlaylistAuthor;
}

export interface IPlaylistItemResponse {
  id: string;
  position: number;
  contentType: PlaylistContentType;
  content: IPlaylistContentSummary;
  addedAt: string;
}

export interface IPlaylistContainingEntry {
  playlistId: string;
  title: string;
  contains: boolean;
  itemId?: string;
}
