import mongoose from 'mongoose';
import type { PaginatedResponse } from '@network/shared';
import {
  JuryAppealModel,
  type IJuryAppealDocument,
} from '../models/jury-appeal.model.js';
import { paginateQuery } from '../../../core/utils/paginate.js';

export const create = (
  caseId: string,
  appealCaseId: string,
  requesterId: string,
  reason: string
): Promise<IJuryAppealDocument> =>
  JuryAppealModel.create({
    caseId: new mongoose.Types.ObjectId(caseId),
    appealCaseId: new mongoose.Types.ObjectId(appealCaseId),
    requesterId: new mongoose.Types.ObjectId(requesterId),
    reason,
  });

export const findByCaseId = (
  caseId: string
): Promise<IJuryAppealDocument | null> =>
  JuryAppealModel.findOne({
    caseId: new mongoose.Types.ObjectId(caseId),
  }).exec();

export const findById = (
  appealId: string
): Promise<IJuryAppealDocument | null> =>
  JuryAppealModel.findById(appealId).exec();

export const findByAppealCaseId = (
  appealCaseId: string
): Promise<IJuryAppealDocument | null> =>
  JuryAppealModel.findOne({
    appealCaseId: new mongoose.Types.ObjectId(appealCaseId),
  }).exec();

export const findByRequesterPaginated = (
  requesterId: string,
  cursor: string | null,
  limit: number
): Promise<
  Omit<PaginatedResponse<IJuryAppealDocument>, 'success' | 'message'>
> =>
  paginateQuery(
    JuryAppealModel,
    { requesterId: new mongoose.Types.ObjectId(requesterId) },
    cursor,
    limit
  );

export const resolve = (
  appealId: string,
  status: 'upheld' | 'overturned',
  resolvedBy?: string,
  note?: string
): Promise<IJuryAppealDocument | null> =>
  JuryAppealModel.findOneAndUpdate(
    { _id: appealId, status: 'pending' },
    {
      $set: {
        status,
        resolvedAt: new Date(),
        ...(resolvedBy !== undefined && {
          resolvedBy: new mongoose.Types.ObjectId(resolvedBy),
        }),
        ...(note !== undefined && { resolutionNote: note }),
      },
    },
    { returnDocument: 'after' }
  ).exec();
