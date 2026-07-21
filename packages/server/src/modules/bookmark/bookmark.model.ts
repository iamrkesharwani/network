import mongoose, { Schema, type Document } from 'mongoose';
import { CONTENT_MODEL_BY_TYPE, type BookmarkableContentType } from '@network/shared';

export interface IBookmarkDocument extends Document {
  userId: mongoose.Types.ObjectId;
  contentType: BookmarkableContentType;
  contentModel: 'Video' | 'Short' | 'Post';
  contentId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmarkDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentType: {
      type: String,
      enum: ['video', 'short', 'post'],
      required: true,
    },
    contentModel: {
      type: String,
      enum: ['Video', 'Short', 'Post'],
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'contentModel',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

bookmarkSchema.pre('validate', function setContentModel() {
  this.contentModel = CONTENT_MODEL_BY_TYPE[this.contentType] as
    | 'Video'
    | 'Short'
    | 'Post';
});

bookmarkSchema.index(
  { userId: 1, contentType: 1, contentId: 1 },
  { unique: true }
);
bookmarkSchema.index({ userId: 1, createdAt: -1 });

export const BookmarkModel = mongoose.model<IBookmarkDocument>(
  'Bookmark',
  bookmarkSchema
);
