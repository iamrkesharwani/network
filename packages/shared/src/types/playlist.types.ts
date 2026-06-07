import { z } from 'zod';
import {
  playlistCreateSchema,
  playlistUpdateSchema,
  playlistItemSchema,
  PLAYLIST_VISIBILITY,
} from '../schemas/playlist.schema.js';

export type PlaylistCreateInput = z.infer<typeof playlistCreateSchema>;
export type PlaylistUpdateInput = z.infer<typeof playlistUpdateSchema>;
export type PlaylistItemInput = z.infer<typeof playlistItemSchema>;
export type PlaylistVisibility = (typeof PLAYLIST_VISIBILITY)[number];

export interface IPlaylistItem {
  id: string;
  playlistId: string;
  videoId?: string;
  shortId?: string;
  addedAt: Date;
  order: number;
}

export interface IPlaylist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  visibility: PlaylistVisibility;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}
