import mongoose from 'mongoose';
import {
  PushSubscriptionModel,
  type IPushSubscriptionDocument,
} from './pushSubscription.model.js';

export const upsertByEndpoint = (
  userId: string,
  endpoint: string,
  keys: { p256dh: string; auth: string },
  userAgent?: string
): Promise<IPushSubscriptionDocument> =>
  PushSubscriptionModel.findOneAndUpdate(
    { endpoint },
    {
      userId: new mongoose.Types.ObjectId(userId),
      endpoint,
      keys,
      userAgent: userAgent ?? null,
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  ).exec();

export const findByUserId = (
  userId: string
): Promise<IPushSubscriptionDocument[]> =>
  PushSubscriptionModel.find({
    userId: new mongoose.Types.ObjectId(userId),
  }).exec();

export const deleteByEndpoint = (endpoint: string): Promise<void> =>
  PushSubscriptionModel.deleteOne({ endpoint })
    .exec()
    .then(() => undefined);
