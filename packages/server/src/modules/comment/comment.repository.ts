import mongoose from 'mongoose';
import type { ContentType, ModerationStatus, PaginatedResponse } from '@network/shared';
import { CommentModel, type ICommentDocument } from './comment.model.js';
import { paginateQuery } from '../../core/utils/paginate.js';

export const create = async (
  userId: string,
  contentType: ContentType,
  contentId: string,
  text: string,
  parentCommentId: string | null
): Promise<ICommentDocument> => {
  const comment = await CommentModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    contentType,
    contentId: new mongoose.Types.ObjectId(contentId),
    parentCommentId: parentCommentId
      ? new mongoose.Types.ObjectId(parentCommentId)
      : null,
    text,
  });
  return comment.populate('userId', 'username avatarUrl');
};

export const findById = (id: string): Promise<ICommentDocument | null> =>
  CommentModel.findById(id).populate('userId', 'username avatarUrl').exec();

export const findTopLevel = async (
  contentType: ContentType,
  contentId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<ICommentDocument>, 'success' | 'message'>> => {
  const result = await paginateQuery(
    CommentModel,
    {
      contentType,
      contentId: new mongoose.Types.ObjectId(contentId),
      parentCommentId: null,
    },
    cursor,
    limit
  );

  await CommentModel.populate(result.data, {
    path: 'userId',
    select: 'username avatarUrl',
  });

  return result;
};

export const findReplies = async (
  parentCommentId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<ICommentDocument>, 'success' | 'message'>> => {
  const result = await paginateQuery(
    CommentModel,
    { parentCommentId: new mongoose.Types.ObjectId(parentCommentId) },
    cursor,
    limit
  );

  await CommentModel.populate(result.data, {
    path: 'userId',
    select: 'username avatarUrl',
  });

  return result;
};

export const updateText = (
  id: string,
  text: string
): Promise<ICommentDocument | null> =>
  CommentModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { text, edited: true },
    { returnDocument: 'after', runValidators: true }
  )
    .populate('userId', 'username avatarUrl')
    .exec();

export const softDeleteById = (
  id: string
): Promise<ICommentDocument | null> =>
  CommentModel.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { returnDocument: 'after' }
  )
    .populate('userId', 'username avatarUrl')
    .exec();

export const incrementReplies = (
  id: string
): Promise<{ repliesCount: number } | null> =>
  CommentModel.findOneAndUpdate(
    { _id: id },
    [{ $set: { repliesCount: { $add: ['$repliesCount', 1] } } }],
    {
      returnDocument: 'after',
      updatePipeline: true,
      projection: { repliesCount: 1 },
    }
  )
    .lean()
    .exec();

export const decrementReplies = (
  id: string
): Promise<{ repliesCount: number } | null> =>
  CommentModel.findOneAndUpdate(
    { _id: id },
    [
      {
        $set: {
          repliesCount: { $max: [{ $add: ['$repliesCount', -1] }, 0] },
        },
      },
    ],
    {
      returnDocument: 'after',
      updatePipeline: true,
      projection: { repliesCount: 1 },
    }
  )
    .lean()
    .exec();

export const incrementLikes = (
  id: string
): Promise<{ likes: number } | null> =>
  CommentModel.findOneAndUpdate(
    { _id: id },
    [{ $set: { likes: { $add: ['$likes', 1] } } }],
    { returnDocument: 'after', updatePipeline: true, projection: { likes: 1 } }
  )
    .lean()
    .exec();

export const decrementLikes = (
  id: string
): Promise<{ likes: number } | null> =>
  CommentModel.findOneAndUpdate(
    { _id: id },
    [{ $set: { likes: { $max: [{ $add: ['$likes', -1] }, 0] } } }],
    { returnDocument: 'after', updatePipeline: true, projection: { likes: 1 } }
  )
    .lean()
    .exec();

export const setModerationStatus = async (
  id: string,
  status: ModerationStatus
): Promise<void> => {
  await CommentModel.updateOne(
    { _id: id },
    { $set: { moderationStatus: status } }
  ).exec();
};
