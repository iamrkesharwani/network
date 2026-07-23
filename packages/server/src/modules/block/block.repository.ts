import mongoose from 'mongoose';
import { BlockModel, type IBlockDocument } from './block.model.js';

export const create = (
  blockerId: string,
  blockedId: string
): Promise<IBlockDocument> =>
  BlockModel.create({
    blockerId: new mongoose.Types.ObjectId(blockerId),
    blockedId: new mongoose.Types.ObjectId(blockedId),
  });

export const deleteRelation = (
  blockerId: string,
  blockedId: string
): Promise<IBlockDocument | null> =>
  BlockModel.findOneAndDelete({
    blockerId: new mongoose.Types.ObjectId(blockerId),
    blockedId: new mongoose.Types.ObjectId(blockedId),
  }).exec();

export const existsEitherDirection = async (
  userIdA: string,
  userIdB: string
): Promise<boolean> => {
  const idA = new mongoose.Types.ObjectId(userIdA);
  const idB = new mongoose.Types.ObjectId(userIdB);

  return (
    (await BlockModel.exists({
      $or: [
        { blockerId: idA, blockedId: idB },
        { blockerId: idB, blockedId: idA },
      ],
    })) !== null
  );
};

export const findBlockedUserIds = async (userId: string): Promise<Set<string>> => {
  const objectId = new mongoose.Types.ObjectId(userId);
  const rows = await BlockModel.find(
    { $or: [{ blockerId: objectId }, { blockedId: objectId }] },
    { blockerId: 1, blockedId: 1 }
  )
    .lean()
    .exec();

  return new Set(
    rows.map((row) =>
      row.blockerId.toString() === userId
        ? row.blockedId.toString()
        : row.blockerId.toString()
    )
  );
};

export const deleteAllByUserId = async (userId: string): Promise<number> => {
  const objectId = new mongoose.Types.ObjectId(userId);
  const result = await BlockModel.deleteMany({
    $or: [{ blockerId: objectId }, { blockedId: objectId }],
  }).exec();
  return result.deletedCount;
};
