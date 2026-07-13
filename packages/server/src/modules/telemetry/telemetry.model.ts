import mongoose, { Schema, Document } from 'mongoose';

export interface IWatchProgressDocument extends Document {
  userId: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  currentTime: number;
  updatedAt: Date;
}

const watchProgressSchema = new Schema<IWatchProgressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    currentTime: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

watchProgressSchema.index({ userId: 1, videoId: 1 }, { unique: true });

export const WatchProgressModel = mongoose.model<IWatchProgressDocument>(
  'WatchProgress',
  watchProgressSchema
);
