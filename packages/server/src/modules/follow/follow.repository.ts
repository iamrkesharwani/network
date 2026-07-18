import mongoose from 'mongoose';
import type { PaginatedResponse } from '@network/shared';
import { MAX_PAGE_LIMIT } from '@network/shared';
import { FollowModel, type IFollowDocument } from './follow.model.js';

const encodeCursor = (doc: IFollowDocument): string =>
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

const isPopulatedUserActive = (
  doc: IFollowDocument,
  populatePath: 'followerId' | 'followeeId'
): boolean => {
  const user = doc[populatePath] as unknown as { status?: string } | null;
  return user?.status === 'active';
};

const buildCursorFilter = (cursor: string | null) => {
  const decoded = cursor ? decodeCursor(cursor) : null;
  if (!decoded) return {};

  return {
    $or: [
      { createdAt: { $lt: decoded.createdAt } },
      {
        createdAt: decoded.createdAt,
        _id: { $lt: new mongoose.Types.ObjectId(decoded.id) },
      },
    ],
  };
};

const paginate = async (
  filter: Record<string, unknown>,
  populatePath: 'followerId' | 'followeeId',
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IFollowDocument>, 'success' | 'message'>> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);

  const raw = (await FollowModel.find({
    ...filter,
    ...buildCursorFilter(cursor),
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(safeLimit + 1)
    .populate(populatePath, 'username name avatarUrl status')
    .lean()
    .exec()) as IFollowDocument[];

  const data = raw.filter((doc) => isPopulatedUserActive(doc, populatePath));

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1];
  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem) : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};

export const create = (
  followerId: string,
  followeeId: string
): Promise<IFollowDocument> =>
  FollowModel.create({
    followerId: new mongoose.Types.ObjectId(followerId),
    followeeId: new mongoose.Types.ObjectId(followeeId),
  });

export const deleteRelation = (
  followerId: string,
  followeeId: string
): Promise<IFollowDocument | null> =>
  FollowModel.findOneAndDelete({
    followerId: new mongoose.Types.ObjectId(followerId),
    followeeId: new mongoose.Types.ObjectId(followeeId),
  }).exec();

export const exists = async (
  followerId: string,
  followeeId: string
): Promise<boolean> =>
  (await FollowModel.exists({
    followerId: new mongoose.Types.ObjectId(followerId),
    followeeId: new mongoose.Types.ObjectId(followeeId),
  })) !== null;

const activeOtherPartyStages = (otherPartyField: 'followerId' | 'followeeId') => [
  {
    $lookup: {
      from: 'users',
      localField: otherPartyField,
      foreignField: '_id',
      as: 'otherParty',
    },
  },
  { $unwind: '$otherParty' },
  { $match: { 'otherParty.status': 'active' } },
];

export const countByFollowee = async (followeeId: string): Promise<number> => {
  const rows = await FollowModel.aggregate<{ count: number }>([
    { $match: { followeeId: new mongoose.Types.ObjectId(followeeId) } },
    ...activeOtherPartyStages('followerId'),
    { $count: 'count' },
  ]);
  return rows[0]?.count ?? 0;
};

export const countByFollower = async (followerId: string): Promise<number> => {
  const rows = await FollowModel.aggregate<{ count: number }>([
    { $match: { followerId: new mongoose.Types.ObjectId(followerId) } },
    ...activeOtherPartyStages('followeeId'),
    { $count: 'count' },
  ]);
  return rows[0]?.count ?? 0;
};

export const countByFolloweeMany = async (
  followeeIds: string[]
): Promise<Map<string, number>> => {
  if (followeeIds.length === 0) return new Map();

  const rows = await FollowModel.aggregate<{
    _id: mongoose.Types.ObjectId;
    count: number;
  }>([
    {
      $match: {
        followeeId: { $in: followeeIds.map((id) => new mongoose.Types.ObjectId(id)) },
      },
    },
    ...activeOtherPartyStages('followerId'),
    { $group: { _id: '$followeeId', count: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [row._id.toString(), row.count]));
};

export const countByFollowerMany = async (
  followerIds: string[]
): Promise<Map<string, number>> => {
  if (followerIds.length === 0) return new Map();

  const rows = await FollowModel.aggregate<{
    _id: mongoose.Types.ObjectId;
    count: number;
  }>([
    {
      $match: {
        followerId: { $in: followerIds.map((id) => new mongoose.Types.ObjectId(id)) },
      },
    },
    ...activeOtherPartyStages('followeeId'),
    { $group: { _id: '$followerId', count: { $sum: 1 } } },
  ]);

  return new Map(rows.map((row) => [row._id.toString(), row.count]));
};

export const deleteAllByUserId = async (userId: string): Promise<number> => {
  const objectId = new mongoose.Types.ObjectId(userId);
  const result = await FollowModel.deleteMany({
    $or: [{ followerId: objectId }, { followeeId: objectId }],
  }).exec();
  return result.deletedCount;
};

export const findFollowedSet = async (
  followerId: string,
  followeeIds: string[]
): Promise<Set<string>> => {
  if (followeeIds.length === 0) return new Set();

  const rows = await FollowModel.find(
    {
      followerId: new mongoose.Types.ObjectId(followerId),
      followeeId: { $in: followeeIds.map((id) => new mongoose.Types.ObjectId(id)) },
    },
    { followeeId: 1 }
  )
    .lean()
    .exec();

  return new Set(rows.map((row) => row.followeeId.toString()));
};

export const findFollowers = (
  followeeId: string,
  cursor: string | null,
  limit: number
) =>
  paginate(
    { followeeId: new mongoose.Types.ObjectId(followeeId) },
    'followerId',
    cursor,
    limit
  );

export const findFollowing = (
  followerId: string,
  cursor: string | null,
  limit: number
) =>
  paginate(
    { followerId: new mongoose.Types.ObjectId(followerId) },
    'followeeId',
    cursor,
    limit
  );
