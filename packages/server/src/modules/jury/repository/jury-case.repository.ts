import mongoose from 'mongoose';
import { JuryCaseModel, type IJuryCaseDocument } from '../models/jury-case.model.js';
import {
  JURY_POOL_SIZE,
  JURY_CONSENSUS_THRESHOLD,
  JURY_CASE_TIMEOUT_MS,
  type ReportableContentType,
  type ReportReasonCode,
  type JuryVerdict,
} from '@network/shared';

export const createCase = (
  contentType: ReportableContentType,
  contentId: string,
  reasonCode: ReportReasonCode | null,
  options?: {
    poolSize?: number;
    consensusThreshold?: number;
    isAppeal?: boolean;
    appealOfCaseId?: string;
  }
): Promise<IJuryCaseDocument> =>
  JuryCaseModel.create({
    contentType,
    contentId: new mongoose.Types.ObjectId(contentId),
    reasonCode,
    poolSize: options?.poolSize ?? JURY_POOL_SIZE,
    consensusThreshold: options?.consensusThreshold ?? JURY_CONSENSUS_THRESHOLD,
    deadline: new Date(Date.now() + JURY_CASE_TIMEOUT_MS),
    isAppeal: options?.isAppeal ?? false,
    ...(options?.appealOfCaseId && {
      appealOfCaseId: new mongoose.Types.ObjectId(options.appealOfCaseId),
    }),
  });

export const findById = (caseId: string): Promise<IJuryCaseDocument | null> =>
  JuryCaseModel.findById(caseId).exec();

export const findOpenCaseForContent = (
  contentType: ReportableContentType,
  contentId: string
): Promise<IJuryCaseDocument | null> =>
  JuryCaseModel.findOne({
    contentType,
    contentId: new mongoose.Types.ObjectId(contentId),
    status: { $in: ['open', 'deciding'] },
  }).exec();

export const markDeciding = async (caseId: string): Promise<void> => {
  await JuryCaseModel.updateOne(
    { _id: caseId, status: 'open' },
    { $set: { status: 'deciding' } }
  ).exec();
};

export const finalize = async (
  caseId: string,
  verdict: JuryVerdict
): Promise<IJuryCaseDocument | null> =>
  JuryCaseModel.findOneAndUpdate(
    { _id: caseId, status: { $in: ['open', 'deciding'] } },
    {
      $set: {
        status: 'resolved',
        verdict,
        resolvedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  ).exec();

export const markAppealed = async (caseId: string): Promise<void> => {
  await JuryCaseModel.updateOne(
    { _id: caseId },
    { $set: { status: 'appealed' } }
  ).exec();
};

export const findTimedOutCases = (
  now: Date,
  limit: number
): Promise<IJuryCaseDocument[]> =>
  JuryCaseModel.find({
    status: { $in: ['open', 'deciding'] },
    deadline: { $lt: now },
  })
    .limit(limit)
    .exec();

export const findLatestResolvedCaseForContent = (
  contentType: ReportableContentType,
  contentId: string
): Promise<IJuryCaseDocument | null> =>
  JuryCaseModel.findOne({
    contentType,
    contentId: new mongoose.Types.ObjectId(contentId),
    isAppeal: false,
    status: { $in: ['resolved', 'appealed'] },
  })
    .sort({ createdAt: -1 })
    .exec();
