import mongoose from 'mongoose';
import { CreatorModel, type ICreatorDocument } from '../creator.model.js';
import { getOrCreate } from './creator.core.repository.js';

export const incrementTrustScore = (
  userId: string,
  amount: number
): Promise<ICreatorDocument> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $inc: { trustScore: amount } },
    { returnDocument: 'after', upsert: true }
  ).exec();

export const incrementTotalViews = (
  userId: string,
  amount: number
): Promise<number> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $inc: { totalViews: amount } },
    { returnDocument: 'after', upsert: true }
  )
    .exec()
    .then((doc) => doc.totalViews);

export const incrementPublishCount = (userId: string): Promise<number> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $inc: { publishCount: 1 } },
    { returnDocument: 'after', upsert: true }
  )
    .exec()
    .then((doc) => doc.publishCount);

export const incrementVideoPublishCount = (userId: string): Promise<number> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $inc: { videoPublishCount: 1 } },
    { returnDocument: 'after', upsert: true }
  )
    .exec()
    .then((doc) => doc.videoPublishCount);

export const incrementShortPublishCount = (userId: string): Promise<number> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $inc: { shortPublishCount: 1 } },
    { returnDocument: 'after', upsert: true }
  )
    .exec()
    .then((doc) => doc.shortPublishCount);

export const incrementPostPublishCount = (userId: string): Promise<number> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $inc: { postPublishCount: 1 } },
    { returnDocument: 'after', upsert: true }
  )
    .exec()
    .then((doc) => doc.postPublishCount);

export const pushActivity = (
  userId: string,
  date: Date
): Promise<ICreatorDocument> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $push: { uploadActivity: date } },
    { returnDocument: 'after', upsert: true }
  ).exec();

export const countDistinctActivityDays = async (
  userId: string
): Promise<number> => {
  const doc = await getOrCreate(userId);
  const days = new Set(
    doc.uploadActivity.map((d) => d.toISOString().slice(0, 10)) // YYYY-MM-DD
  );
  return days.size;
};
