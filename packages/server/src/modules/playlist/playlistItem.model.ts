import mongoose, { Schema, type Document } from 'mongoose';
import { CONTENT_MODEL_BY_TYPE, type PlaylistContentType } from '@network/shared';

export interface IPlaylistItemDocument extends Document {
  playlistId: mongoose.Types.ObjectId;
  contentType: PlaylistContentType;
  contentModel: 'Video' | 'Short';
  contentId: mongoose.Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const playlistItemSchema = new Schema<IPlaylistItemDocument>(
  {
    playlistId: {
      type: Schema.Types.ObjectId,
      ref: 'Playlist',
      required: true,
    },
    contentType: {
      type: String,
      enum: ['video', 'short'],
      required: true,
    },
    contentModel: {
      type: String,
      enum: ['Video', 'Short'],
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'contentModel',
    },
    position: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

playlistItemSchema.pre('validate', function setContentModel() {
  this.contentModel = CONTENT_MODEL_BY_TYPE[this.contentType] as
    | 'Video'
    | 'Short';
});

playlistItemSchema.index(
  { playlistId: 1, contentType: 1, contentId: 1 },
  { unique: true }
);
playlistItemSchema.index({ playlistId: 1, position: 1 });

export const PlaylistItemModel = mongoose.model<IPlaylistItemDocument>(
  'PlaylistItem',
  playlistItemSchema
);
