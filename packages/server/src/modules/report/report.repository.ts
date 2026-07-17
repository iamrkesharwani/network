import mongoose from 'mongoose';
import { ReportModel, type IReportDocument } from './report.model.js';
import {
  MAX_PAGE_LIMIT,
  type PaginatedResponse,
  type ReportableContentType,
  type ReportReasonCode,
} from '@network/shared';

const encodeCursor = (doc: IReportDocument): string =>
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

export const create = (
  reporterId: string,
  contentType: ReportableContentType,
  contentId: string,
  reasonCode: ReportReasonCode,
  note?: string
): Promise<IReportDocument> => {
  return ReportModel.create({
    reporterId: new mongoose.Types.ObjectId(reporterId),
    contentType,
    contentId: new mongoose.Types.ObjectId(contentId),
    reasonCode,
    ...(note !== undefined && { note }),
  });
};

export const findByReporterAndContent = (
  reporterId: string,
  contentType: ReportableContentType,
  contentId: string
): Promise<IReportDocument | null> => {
  return ReportModel.findOne({
    reporterId: new mongoose.Types.ObjectId(reporterId),
    contentType,
    contentId: new mongoose.Types.ObjectId(contentId),
  }).exec();
};

export const countPendingForContent = (
  contentType: ReportableContentType,
  contentId: string
): Promise<number> => {
  return ReportModel.countDocuments({
    contentType,
    contentId: new mongoose.Types.ObjectId(contentId),
    status: 'pending',
  }).exec();
};

export const markInReviewForContent = async (
  contentType: ReportableContentType,
  contentId: string
): Promise<void> => {
  await ReportModel.updateMany(
    {
      contentType,
      contentId: new mongoose.Types.ObjectId(contentId),
      status: 'pending',
    },
    { $set: { status: 'in_review' } }
  ).exec();
};

export const markResolvedForContent = async (
  contentType: ReportableContentType,
  contentId: string
): Promise<void> => {
  await ReportModel.updateMany(
    {
      contentType,
      contentId: new mongoose.Types.ObjectId(contentId),
      status: 'in_review',
    },
    { $set: { status: 'resolved' } }
  ).exec();
};

export const markDismissedForContent = async (
  contentType: ReportableContentType,
  contentId: string
): Promise<void> => {
  await ReportModel.updateMany(
    {
      contentType,
      contentId: new mongoose.Types.ObjectId(contentId),
      status: 'in_review',
    },
    { $set: { status: 'dismissed' } }
  ).exec();
};

export const findLatestForContent = (
  contentType: ReportableContentType,
  contentId: string
): Promise<IReportDocument | null> => {
  return ReportModel.findOne({
    contentType,
    contentId: new mongoose.Types.ObjectId(contentId),
    status: 'in_review',
  })
    .sort({ createdAt: -1 })
    .exec();
};

export const findReporterIdsForContent = async (
  contentType: ReportableContentType,
  contentId: string
): Promise<string[]> => {
  const ids = await ReportModel.distinct('reporterId', {
    contentType,
    contentId: new mongoose.Types.ObjectId(contentId),
  }).exec();

  return (ids as mongoose.Types.ObjectId[]).map((id) => id.toString());
};

export const findByReporterPaginated = async (
  reporterId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IReportDocument>, 'success' | 'message'>> => {
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

  const data = (await ReportModel.find({
    reporterId: new mongoose.Types.ObjectId(reporterId),
    ...cursorFilter,
  })
    .sort({ createdAt: -1, _id: -1 })
    .limit(safeLimit + 1)
    .lean()
    .exec()) as IReportDocument[];

  const hasNextPage = data.length > safeLimit;
  if (hasNextPage) data.pop();

  const lastItem = data[data.length - 1];
  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem) : null;

  return {
    data,
    meta: { nextCursor, hasNextPage, limit: safeLimit },
  };
};
