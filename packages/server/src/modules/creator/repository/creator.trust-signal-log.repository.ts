import mongoose from 'mongoose';
import {
  TrustSignalLogModel,
  type ITrustSignalLogDocument,
} from '../trust-signal-log.model.js';

export const countRecentSignals = (
  userId: string,
  signalType: string,
  windowStart: Date
): Promise<number> =>
  TrustSignalLogModel.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    signalType,
    createdAt: { $gte: windowStart },
  }).exec();

export const create = (
  userId: string,
  signalType: string,
  rawWeight: number,
  multiplier: number,
  appliedPoints: number
): Promise<ITrustSignalLogDocument> =>
  TrustSignalLogModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    signalType,
    rawWeight,
    multiplier,
    appliedPoints,
  });

export const findMostRecentForUser = (
  userId: string
): Promise<ITrustSignalLogDocument | null> =>
  TrustSignalLogModel.findOne({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .exec();
