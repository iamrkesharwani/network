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

export const findRandomEligibleJurorUserIds = async (
  minScore: number,
  excludeUserIds: string[],
  poolSize: number
): Promise<string[]> => {
  const excludeObjectIds = excludeUserIds.map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  const docs = await CreatorModel.aggregate<{
    userId: mongoose.Types.ObjectId;
  }>([
    {
      $match: {
        trustScore: { $gte: minScore },
        userId: { $nin: excludeObjectIds },
      },
    },
    { $sample: { size: poolSize } },
    { $project: { userId: 1, _id: 0 } },
  ]);

  return docs.map((doc) => doc.userId.toString());
};
