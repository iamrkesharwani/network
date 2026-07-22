import type { KeyBundlePublishInput } from '@network/shared';
import {
  KeyBundleModel,
  type IKeyBundleDocument,
} from '../models/keyBundle.model.js';

export const findByUserId = (
  userId: string
): Promise<IKeyBundleDocument | null> =>
  KeyBundleModel.findOne({ userId }).exec();

export const findByUserIdWithRecoveryHash = (
  userId: string
): Promise<IKeyBundleDocument | null> =>
  KeyBundleModel.findOne({ userId }).select('+recoveryTokenHash').exec();

export const findPublicByUserIds = (
  userIds: string[]
): Promise<IKeyBundleDocument[]> =>
  KeyBundleModel.find({ userId: { $in: userIds } })
    .select('userId publicKey keyVersion')
    .exec();

export const findUserIdsWithKeyBundle = (
  userIds: string[]
): Promise<string[]> =>
  KeyBundleModel.find({ userId: { $in: userIds } })
    .select('userId')
    .exec()
    .then((docs) => docs.map((doc) => doc.userId.toString()));

export const upsertKeyBundle = (
  userId: string,
  data: KeyBundlePublishInput,
  recoveryTokenHash?: string
): Promise<IKeyBundleDocument> => {
  const recoveryFields = data.recoveryWrappedPrivateKey
    ? {
        recoveryWrappedPrivateKey: data.recoveryWrappedPrivateKey,
        recoveryWrapIv: data.recoveryWrapIv,
        recoveryWrapSalt: data.recoveryWrapSalt,
        recoveryPbkdf2Iterations: data.recoveryPbkdf2Iterations,
        recoveryTokenHash,
      }
    : {};

  return KeyBundleModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        publicKey: data.publicKey,
        wrappedPrivateKey: data.wrappedPrivateKey,
        wrapIv: data.wrapIv,
        wrapSalt: data.wrapSalt,
        pbkdf2Iterations: data.pbkdf2Iterations,
        ...recoveryFields,
      },
      $inc: { keyVersion: 1 },
    },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).exec() as Promise<IKeyBundleDocument>;
};
