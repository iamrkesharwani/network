import {
  KeyBundleHistoryModel,
  type IKeyBundleHistoryDocument,
} from '../models/keyBundleHistory.model.js';
import type { IKeyBundleDocument } from '../models/keyBundle.model.js';

export const archiveCurrent = (
  current: IKeyBundleDocument
): Promise<IKeyBundleHistoryDocument> =>
  KeyBundleHistoryModel.create({
    userId: current.userId,
    keyVersion: current.keyVersion,
    wrappedPrivateKey: current.wrappedPrivateKey,
    wrapIv: current.wrapIv,
    wrapSalt: current.wrapSalt,
    pbkdf2Iterations: current.pbkdf2Iterations,
  });

export const findByUserId = (
  userId: string
): Promise<IKeyBundleHistoryDocument[]> =>
  KeyBundleHistoryModel.find({ userId }).sort({ keyVersion: -1 }).exec();

export const updateWrapForVersion = (
  userId: string,
  keyVersion: number,
  data: {
    wrappedPrivateKey: string;
    wrapIv: string;
    wrapSalt: string;
    pbkdf2Iterations: number;
  }
): Promise<void> =>
  KeyBundleHistoryModel.updateOne(
    { userId, keyVersion },
    { $set: data }
  )
    .exec()
    .then(() => undefined);
