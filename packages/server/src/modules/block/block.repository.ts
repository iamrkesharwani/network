import mongoose from 'mongoose';
import type { PaginatedResponse } from '@network/shared';
import { MAX_PAGE_LIMIT } from '@network/shared';
import { BlockModel, type IBlockDocument } from './block.model.js';

const encodeCursor = (doc: IBlockDocument): string =>
  Buffer.from(`${doc.createdAt.getTime()}_${doc._id.toString()}`).toString(
    'base64url'
  );

const decodeCursor = (
  cursor: string
): { createdAt: Date; id: string } | null => {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const [timestamp, id] = decoded.split('_');
    if (!timestamp || !id || !mongoose.isValidObjectId(id)) return null;

    const ms = Number(timestamp);
    if (!Number.isFinite(ms)) return null;

    return { createdAt: new Date(ms), id };
  } catch {
    return null;
  }
};

const isPopulatedBlockedActive = (doc: IBlockDocument): boolean => {
  const blocked = doc.blockedId as unknown as { status?: string } | null;
  return blocked?.status === 'active';
};

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

export const findBlockedByBlocker = async (
  blockerId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IBlockDocument>, 'success' | 'message'>> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
  const decoded = cursor ? decodeCursor(cursor) : null;

  const cursorFilter = decoded
    ? {
        $or: [
          { createdAt: { $lt: decoded.createdAt } },
          {
            createdAt: decoded.createdAt,
            _id: { $lt: new mongoose.Types.ObjectId(decoded.id) },
          },
        ],
      }
    : {};

  const raw = (await BlockModel.find({
    blockerId: new mongoose.Types.ObjectId(blockerId),
    ...cursorFilter,
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(safeLimit + 1)
    .populate('blockedId', 'username name avatarUrl status')
    .lean()
    .exec()) as IBlockDocument[];

  const data = raw.filter(isPopulatedBlockedActive);

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1];
  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem) : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};

export const deleteAllByUserId = async (userId: string): Promise<number> => {
  const objectId = new mongoose.Types.ObjectId(userId);
  const result = await BlockModel.deleteMany({
    $or: [{ blockerId: objectId }, { blockedId: objectId }],
  }).exec();
  return result.deletedCount;
};
