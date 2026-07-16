import mongoose from 'mongoose';
import type { AccountDeletionAdapter } from '../../account/account.deletion.types.js';
import { PostModel } from '../post.model.js';
import { imageProvider } from '../../../core/providers/provider.js';
import { logger } from '../../../core/utils/logger.js';

const deleteAllForUser = async (userId: string): Promise<number> => {
  const owned = await PostModel.find({
    userId: new mongoose.Types.ObjectId(userId),
  }).exec();

  for (const doc of owned) {
    if (doc.mediaType === 'image') {
      for (const imageUrl of doc.imageUrls ?? []) {
        await imageProvider
          .deleteImage(imageUrl)
          .catch((e) =>
            logger.warn(
              e,
              `Account deletion: failed to delete post image ${imageUrl}`
            )
          );
      }
    }
    await PostModel.deleteOne({ _id: doc._id }).exec();
  }

  return owned.length;
};

export const postDeletionAdapter: AccountDeletionAdapter = {
  contentType: 'post',
  deleteAllForUser,
};
