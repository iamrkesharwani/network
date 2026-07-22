import mongoose, { Schema, type Document } from 'mongoose';

export interface IPushSubscriptionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscriptionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

pushSubscriptionSchema.index({ userId: 1 });

export const PushSubscriptionModel = mongoose.model<IPushSubscriptionDocument>(
  'PushSubscription',
  pushSubscriptionSchema
);
