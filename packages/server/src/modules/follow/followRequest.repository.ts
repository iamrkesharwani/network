import mongoose from 'mongoose';
import type { PaginatedResponse } from '@network/shared';
import { MAX_PAGE_LIMIT } from '@network/shared';
import {
  FollowRequestModel,
  type IFollowRequestDocument,
} from './followRequest.model.js';

const encodeCursor = (doc: IFollowRequestDocument): string =>
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

const isPopulatedRequesterActive = (doc: IFollowRequestDocument): boolean => {
  const requester = doc.requesterId as unknown as { status?: string } | null;
  return requester?.status === 'active';
};

export const create = (
  requesterId: string,
  targetId: string
): Promise<IFollowRequestDocument> =>
  FollowRequestModel.create({
    requesterId: new mongoose.Types.ObjectId(requesterId),
    targetId: new mongoose.Types.ObjectId(targetId),
  });

export const deleteRelation = (
  requesterId: string,
  targetId: string
): Promise<IFollowRequestDocument | null> =>
  FollowRequestModel.findOneAndDelete({
    requesterId: new mongoose.Types.ObjectId(requesterId),
    targetId: new mongoose.Types.ObjectId(targetId),
  }).exec();

export const exists = async (
  requesterId: string,
  targetId: string
): Promise<boolean> =>
  (await FollowRequestModel.exists({
    requesterId: new mongoose.Types.ObjectId(requesterId),
    targetId: new mongoose.Types.ObjectId(targetId),
  })) !== null;

export const findRequestedSet = async (
  requesterId: string,
  targetIds: string[]
): Promise<Set<string>> => {
  if (targetIds.length === 0) return new Set();

  const rows = await FollowRequestModel.find(
    {
      requesterId: new mongoose.Types.ObjectId(requesterId),
      targetId: { $in: targetIds.map((id) => new mongoose.Types.ObjectId(id)) },
    },
    { targetId: 1 }
  )
    .lean()
    .exec();

  return new Set(rows.map((row) => row.targetId.toString()));
};

export const countIncomingForTarget = (targetId: string): Promise<number> =>
  FollowRequestModel.countDocuments({
    targetId: new mongoose.Types.ObjectId(targetId),
  }).exec();

export const findByIdForTarget = (
  requestId: string,
  targetId: string
): Promise<IFollowRequestDocument | null> =>
  FollowRequestModel.findOne({
    _id: requestId,
    targetId: new mongoose.Types.ObjectId(targetId),
  }).exec();

export const findIncomingForTarget = async (
  targetId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IFollowRequestDocument>, 'success' | 'message'>> => {
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

  const raw = (await FollowRequestModel.find({
    targetId: new mongoose.Types.ObjectId(targetId),
    ...cursorFilter,
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(safeLimit + 1)
    .populate('requesterId', 'username name avatarUrl status')
    .lean()
    .exec()) as IFollowRequestDocument[];

  const data = raw.filter(isPopulatedRequesterActive);

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1];
  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem) : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};

export const findAllForTarget = (
  targetId: string
): Promise<IFollowRequestDocument[]> =>
  FollowRequestModel.find({
    targetId: new mongoose.Types.ObjectId(targetId),
  }).exec();

export const deleteAllForTarget = (targetId: string): Promise<number> =>
  FollowRequestModel.deleteMany({
    targetId: new mongoose.Types.ObjectId(targetId),
  })
    .exec()
    .then((result) => result.deletedCount);

export const deleteAllByUserId = async (userId: string): Promise<number> => {
  const objectId = new mongoose.Types.ObjectId(userId);
  const result = await FollowRequestModel.deleteMany({
    $or: [{ requesterId: objectId }, { targetId: objectId }],
  }).exec();
  return result.deletedCount;
};
