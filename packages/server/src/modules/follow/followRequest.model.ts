import mongoose, { Schema, type Document } from 'mongoose';

export interface IFollowRequestDocument extends Document {
  requesterId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const followRequestSchema = new Schema<IFollowRequestDocument>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

followRequestSchema.index({ requesterId: 1, targetId: 1 }, { unique: true });
followRequestSchema.index({ targetId: 1, createdAt: -1 });

export const FollowRequestModel = mongoose.model<IFollowRequestDocument>(
  'FollowRequest',
  followRequestSchema
);
