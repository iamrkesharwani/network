import mongoose, { Schema, type Document } from 'mongoose';
import {
  CONTENT_TYPES,
  CONTENT_MODEL_BY_TYPE,
  type ContentType,
} from '@network/shared';

export interface IShareDocument extends Document {
  sharerId: mongoose.Types.ObjectId | null;
  contentType: ContentType;
  contentModel: 'Video' | 'Short' | 'Post';
  contentId: mongoose.Types.ObjectId;
  ref: string;
  createdAt: Date;
}

const shareSchema = new Schema<IShareDocument>(
  {
    sharerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    contentType: {
      type: String,
      enum: CONTENT_TYPES,
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
    ref: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

shareSchema.pre('validate', function setContentModel() {
  this.contentModel = CONTENT_MODEL_BY_TYPE[this.contentType] as
    | 'Video'
    | 'Short'
    | 'Post';
});

shareSchema.index({ contentType: 1, contentId: 1 });

export const ShareModel = mongoose.model<IShareDocument>('Share', shareSchema);
