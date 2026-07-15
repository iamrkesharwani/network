import mongoose, { Schema, Document } from 'mongoose';
import { HISTORY_CONTENT_TYPES, type HistoryContentType } from '@network/shared';

const CONTENT_MODEL_BY_TYPE: Record<HistoryContentType, 'Video' | 'Short'> = {
  video: 'Video',
  short: 'Short',
};

export interface IHistoryDocument extends Document {
  userId: mongoose.Types.ObjectId;
  contentType: HistoryContentType;
  contentModel: 'Video' | 'Short';
  contentId: mongoose.Types.ObjectId;
  currentTime: number;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const historySchema = new Schema<IHistoryDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentType: {
      type: String,
      enum: HISTORY_CONTENT_TYPES,
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
    currentTime: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

historySchema.pre('validate', function setContentModel() {
  this.contentModel = CONTENT_MODEL_BY_TYPE[this.contentType];
});

historySchema.index({ userId: 1, contentType: 1, contentId: 1 }, { unique: true });
historySchema.index({ userId: 1, updatedAt: -1 });

export const HistoryModel = mongoose.model<IHistoryDocument>(
  'History',
  historySchema
);
