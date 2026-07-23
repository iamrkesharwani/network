import mongoose from 'mongoose';
import type {
  PaginatedResponse,
  PlaylistCreateInput,
  PlaylistUpdateInput,
} from '@network/shared';
import { MAX_PAGE_LIMIT } from '@network/shared';
import { PlaylistModel, type IPlaylistDocument } from '../playlist.model.js';

const encodeCursor = (doc: IPlaylistDocument): string =>
  Buffer.from(`${doc.updatedAt.getTime()}_${doc._id.toString()}`).toString(
    'base64url'
  );

const decodeCursor = (
  cursor: string
): { updatedAt: Date; id: string } | null => {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const [timestamp, id] = decoded.split('_');
    if (!timestamp || !id || !mongoose.isValidObjectId(id)) return null;

    const ms = Number(timestamp);
    if (!Number.isFinite(ms)) return null;

    return { updatedAt: new Date(ms), id };
  } catch {
    return null;
  }
};

export const create = (
  userId: string,
  input: PlaylistCreateInput
): Promise<IPlaylistDocument> =>
  PlaylistModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    title: input.title,
    ...(input.description !== undefined && { description: input.description }),
    visibility: input.visibility,
  });

export const findById = (
  playlistId: string
): Promise<IPlaylistDocument | null> => PlaylistModel.findById(playlistId).exec();

export interface PopulatedAuthor {
  _id: mongoose.Types.ObjectId;
  username: string;
}

export const findByIdWithAuthor = (
  playlistId: string
): Promise<IPlaylistDocument | null> =>
  PlaylistModel.findById(playlistId).populate('userId', 'username').exec();

export const setCoverImage = (
  playlistId: string,
  coverImageUrl: string
): Promise<IPlaylistDocument | null> =>
  PlaylistModel.findByIdAndUpdate(
    playlistId,
    { $set: { coverImageUrl } },
    { new: true }
  ).exec();

export const removeCoverImage = (
  playlistId: string
): Promise<IPlaylistDocument | null> =>
  PlaylistModel.findByIdAndUpdate(
    playlistId,
    { $unset: { coverImageUrl: 1 } },
    { new: true }
  ).exec();

export const update = (
  playlistId: string,
  input: PlaylistUpdateInput
): Promise<IPlaylistDocument | null> =>
  PlaylistModel.findByIdAndUpdate(
    playlistId,
    { $set: input },
    { new: true }
  ).exec();

export const deleteById = (
  playlistId: string
): Promise<IPlaylistDocument | null> =>
  PlaylistModel.findByIdAndDelete(playlistId).exec();

export const incrementItemCount = (
  playlistId: string,
  delta: number
): Promise<IPlaylistDocument | null> =>
  PlaylistModel.findByIdAndUpdate(
    playlistId,
    { $inc: { itemCount: delta } },
    { new: true }
  ).exec();

export const findByUserPaginated = async (
  userId: string,
  cursor: string | null,
  limit: number,
  extraFilter: Record<string, unknown> = {}
): Promise<Omit<PaginatedResponse<IPlaylistDocument>, 'success' | 'message'>> => {
  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
  const decoded = cursor ? decodeCursor(cursor) : null;

  const cursorFilter = decoded
    ? {
        $or: [
          { updatedAt: { $lt: decoded.updatedAt } },
          {
            updatedAt: decoded.updatedAt,
            _id: { $lt: new mongoose.Types.ObjectId(decoded.id) },
          },
        ],
      }
    : {};

  const data = (await PlaylistModel.find({
    userId: new mongoose.Types.ObjectId(userId),
    ...extraFilter,
    ...cursorFilter,
  })
    .sort({ updatedAt: -1, _id: -1 })
    .limit(safeLimit + 1)
    .lean()
    .exec()) as IPlaylistDocument[];

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1];
  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem) : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};
