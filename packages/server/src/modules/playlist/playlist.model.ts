import mongoose, { Schema, type Document } from 'mongoose';
import {
  CONTENT_VISIBILITY,
  PLAYLIST_TITLE_MAX_LENGTH,
  PLAYLIST_DESCRIPTION_MAX_LENGTH,
  type ContentVisibility,
} from '@network/shared';

export interface IPlaylistDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  visibility: ContentVisibility;
  itemCount: number;
  coverImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const playlistSchema = new Schema<IPlaylistDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: PLAYLIST_TITLE_MAX_LENGTH,
    },
    description: {
      type: String,
      trim: true,
      maxlength: PLAYLIST_DESCRIPTION_MAX_LENGTH,
    },
    visibility: {
      type: String,
      enum: CONTENT_VISIBILITY,
      default: 'public',
    },
    itemCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    coverImageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

playlistSchema.index({ userId: 1, updatedAt: -1 });

export const PlaylistModel = mongoose.model<IPlaylistDocument>(
  'Playlist',
  playlistSchema
);
