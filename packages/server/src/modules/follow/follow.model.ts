import mongoose, { Schema, type Document } from 'mongoose';

export interface IFollowDocument extends Document {
  followerId: mongoose.Types.ObjectId;
  followeeId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<IFollowDocument>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    followeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

followSchema.index({ followerId: 1, followeeId: 1 }, { unique: true });
followSchema.index({ followeeId: 1, createdAt: -1 });
followSchema.index({ followerId: 1, createdAt: -1 });

export const FollowModel = mongoose.model<IFollowDocument>(
  'Follow',
  followSchema
);
