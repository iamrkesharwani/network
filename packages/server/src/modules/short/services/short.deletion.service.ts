import mongoose from 'mongoose';
import type { AccountDeletionAdapter } from '../../account/account.deletion.types.js';
import { ShortModel } from '../short.model.js';
import {
  storageProvider,
  videoProvider,
  imageProvider,
} from '../../../core/providers/provider.js';
import { logger } from '../../../core/utils/logger.js';

const deleteAllForUser = async (userId: string): Promise<number> => {
  const owned = await ShortModel.find({
    userId: new mongoose.Types.ObjectId(userId),
  })
    .select('+storageKey')
    .exec();

  for (const doc of owned) {
    if (doc.providerVideoId) {
      await videoProvider
        .deleteVideo(doc.providerVideoId)
        .catch((e) =>
          logger.warn(
            e,
            `Account deletion: failed to delete provider video ${doc.providerVideoId}`
          )
        );
    }
    if (doc.storageKey) {
      await storageProvider
        .deleteObject(doc.storageKey)
        .catch((e) =>
          logger.warn(
            e,
            `Account deletion: failed to delete storage object ${doc.storageKey}`
          )
        );
    }
    if (doc.thumbnailUrl) {
      await imageProvider
        .deleteImage(doc.thumbnailUrl)
        .catch((e) =>
          logger.warn(
            e,
            `Account deletion: failed to delete thumbnail ${doc.thumbnailUrl}`
          )
        );
    }
    await ShortModel.deleteOne({ _id: doc._id }).exec();
  }

  return owned.length;
};

export const shortDeletionAdapter: AccountDeletionAdapter = {
  contentType: 'short',
  deleteAllForUser,
};
