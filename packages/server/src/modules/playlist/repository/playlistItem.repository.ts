import mongoose from 'mongoose';
import type { PaginatedResponse, PlaylistContentType } from '@network/shared';
import { CONTENT_MODEL_BY_TYPE, MAX_PAGE_LIMIT } from '@network/shared';
import {
  PlaylistItemModel,
  type IPlaylistItemDocument,
} from '../playlistItem.model.js';

interface MongoDuplicateKeyError {
  code?: number;
}

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as MongoDuplicateKeyError).code === 11000;

export const findItem = (
  playlistId: string,
  contentType: PlaylistContentType,
  contentId: string
): Promise<IPlaylistItemDocument | null> =>
  PlaylistItemModel.findOne({
    playlistId: new mongoose.Types.ObjectId(playlistId),
    contentType,
    contentId: new mongoose.Types.ObjectId(contentId),
  }).exec();

export const findItemById = (
  itemId: string
): Promise<IPlaylistItemDocument | null> =>
  PlaylistItemModel.findById(itemId).exec();

export const addItem = async (
  playlistId: string,
  contentType: PlaylistContentType,
  contentId: string,
  position: number
): Promise<{ item: IPlaylistItemDocument; created: boolean }> => {
  try {
    const item = await PlaylistItemModel.create({
      playlistId: new mongoose.Types.ObjectId(playlistId),
      contentType,
      contentModel: CONTENT_MODEL_BY_TYPE[contentType] as 'Video' | 'Short',
      contentId: new mongoose.Types.ObjectId(contentId),
      position,
    });
    return { item, created: true };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const existing = await findItem(playlistId, contentType, contentId);
      if (existing) return { item: existing, created: false };
    }
    throw error;
  }
};

export const removeItem = async (
  itemId: string
): Promise<IPlaylistItemDocument | null> => {
  const removed = await PlaylistItemModel.findByIdAndDelete(itemId).exec();
  if (!removed) return null;

  await PlaylistItemModel.updateMany(
    { playlistId: removed.playlistId, position: { $gt: removed.position } },
    { $inc: { position: -1 } }
  ).exec();

  return removed;
};

export const reorder = async (
  playlistId: string,
  itemId: string,
  fromPosition: number,
  toIndex: number
): Promise<void> => {
  if (fromPosition === toIndex) return;

  const playlistObjectId = new mongoose.Types.ObjectId(playlistId);

  if (fromPosition < toIndex) {
    await PlaylistItemModel.updateMany(
      {
        playlistId: playlistObjectId,
        position: { $gt: fromPosition, $lte: toIndex },
      },
      { $inc: { position: -1 } }
    ).exec();
  } else {
    await PlaylistItemModel.updateMany(
      {
        playlistId: playlistObjectId,
        position: { $gte: toIndex, $lt: fromPosition },
      },
      { $inc: { position: 1 } }
    ).exec();
  }

  await PlaylistItemModel.findByIdAndUpdate(itemId, {
    $set: { position: toIndex },
  }).exec();
};

export const deleteAllByPlaylistId = async (
  playlistId: string
): Promise<void> => {
  await PlaylistItemModel.deleteMany({
    playlistId: new mongoose.Types.ObjectId(playlistId),
  }).exec();
};

export const findItemsPaginated = async (
  playlistId: string,
  cursor: string | null,
  limit: number
): Promise<
  Omit<PaginatedResponse<IPlaylistItemDocument>, 'success' | 'message'>
> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
  const afterPosition = cursor ? Number(Buffer.from(cursor, 'base64url').toString('utf8')) : -1;
  const safeAfterPosition = Number.isFinite(afterPosition) ? afterPosition : -1;

  const data = (await PlaylistItemModel.find({
    playlistId: new mongoose.Types.ObjectId(playlistId),
    position: { $gt: safeAfterPosition },
  })
    .sort({ position: 1 })
    .limit(safeLimit + 1)
    .populate('contentId')
    .lean()
    .exec()) as IPlaylistItemDocument[];

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1];
  const nextCursor =
    hasNextPage && lastItem
      ? Buffer.from(String(lastItem.position)).toString('base64url')
      : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};

export const findContaining = async (
  playlistIds: string[],
  contentType: PlaylistContentType,
  contentId: string
): Promise<Map<string, string>> => {
  if (playlistIds.length === 0) return new Map();

  const docs = await PlaylistItemModel.find({
    playlistId: {
      $in: playlistIds.map((id) => new mongoose.Types.ObjectId(id)),
    },
    contentType,
    contentId: new mongoose.Types.ObjectId(contentId),
  })
    .select('playlistId')
    .lean()
    .exec();

  return new Map(
    docs.map((doc) => [doc.playlistId.toString(), doc._id.toString()])
  );
};

export const findFirstItemsByPlaylistIds = async (
  playlistIds: string[]
): Promise<Map<string, string | undefined>> => {
  if (playlistIds.length === 0) return new Map();

  const docs = (await PlaylistItemModel.find({
    playlistId: {
      $in: playlistIds.map((id) => new mongoose.Types.ObjectId(id)),
    },
    position: 0,
  })
    .populate('contentId', 'thumbnailUrl')
    .lean()
    .exec()) as IPlaylistItemDocument[];

  const map = new Map<string, string | undefined>();
  for (const doc of docs) {
    const content = doc.contentId as unknown as { thumbnailUrl?: string } | null;
    map.set(doc.playlistId.toString(), content?.thumbnailUrl);
  }
  return map;
};
