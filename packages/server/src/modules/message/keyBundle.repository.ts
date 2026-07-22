import type { KeyBundlePublishInput } from '@network/shared';
import { KeyBundleModel, type IKeyBundleDocument } from './keyBundle.model.js';

export const findByUserId = (
  userId: string
): Promise<IKeyBundleDocument | null> =>
  KeyBundleModel.findOne({ userId }).exec();

export const findPublicByUserIds = (
  userIds: string[]
): Promise<IKeyBundleDocument[]> =>
  KeyBundleModel.find({ userId: { $in: userIds } })
    .select('userId publicKey keyVersion')
    .exec();

export const upsertKeyBundle = (
  userId: string,
  data: KeyBundlePublishInput
): Promise<IKeyBundleDocument> =>
  KeyBundleModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        publicKey: data.publicKey,
        wrappedPrivateKey: data.wrappedPrivateKey,
        wrapIv: data.wrapIv,
        wrapSalt: data.wrapSalt,
        pbkdf2Iterations: data.pbkdf2Iterations,
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
