import mongoose, { Schema, type Document } from 'mongoose';
import {
  ENGAGEABLE_CONTENT_TYPES,
  CONTENT_MODEL_BY_TYPE,
  type EngageableContentType,
} from '@network/shared';

export interface ILikeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  contentType: EngageableContentType;
  contentModel: 'Video' | 'Short' | 'Post' | 'Comment';
  contentId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILikeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentType: {
      type: String,
      enum: ENGAGEABLE_CONTENT_TYPES,
      required: true,
    },
    contentModel: {
      type: String,
      enum: ['Video', 'Short', 'Post', 'Comment'],
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

likeSchema.pre('validate', function setContentModel() {
  this.contentModel = CONTENT_MODEL_BY_TYPE[this.contentType];
});

likeSchema.index({ userId: 1, contentType: 1, contentId: 1 }, { unique: true });
likeSchema.index({ contentType: 1, contentId: 1 });

export const LikeModel = mongoose.model<ILikeDocument>('Like', likeSchema);
