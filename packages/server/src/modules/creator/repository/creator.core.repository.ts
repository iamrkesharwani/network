import mongoose from 'mongoose';
import { CreatorModel, type ICreatorDocument } from '../creator.model.js';

export const getOrCreate = (userId: string): Promise<ICreatorDocument> =>
  CreatorModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $setOnInsert: { userId: new mongoose.Types.ObjectId(userId) } },
    { returnDocument: 'after', upsert: true }
  ).exec();

export const findByUserId = (
  userId: string
): Promise<ICreatorDocument | null> =>
  CreatorModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).exec();
