import mongoose from 'mongoose';
import {
  CONTENT_RETENTION_DAYS,
  UNLISTED_CONTENT_TTL_DAYS,
  UNLISTED_EXPIRY_WARNING_DAYS_BEFORE,
  UNLISTED_EXPIRY_WARNING_SOCKET_EVENT,
  SITE_NAME,
  type IUnlistedExpiryWarningEvent,
} from '@network/shared';
import type { ContentReaperAdapter } from '../../../core/reaper/contentReaper.types.js';
import { PostModel } from '../post.model.js';
import { imageProvider } from '../../../core/providers/provider.js';
import { emitToUser } from '../../../core/config/socket.js';
import { queueGenericEmail } from '../../email/email.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import { daysAgo } from '../../../core/utils/daysAgo.js';
import { logger } from '../../../core/utils/logger.js';

const reapExpiredSoftDeletes = async (): Promise<number> => {
  const expired = await PostModel.find({
    deletedAt: { $ne: null, $lte: daysAgo(CONTENT_RETENTION_DAYS) },
  }).exec();

  for (const doc of expired) {
    if (doc.mediaType === 'image') {
      for (const imageUrl of doc.imageUrls ?? []) {
        await imageProvider
          .deleteImage(imageUrl)
          .catch((e) =>
            logger.warn(e, `Reaper: failed to delete post image ${imageUrl}`)
          );
      }
    }
    await PostModel.deleteOne({ _id: doc._id }).exec();
  }

  return expired.length;
};

const expireUnlistedContent = async (): Promise<number> => {
  const result = await PostModel.updateMany(
    {
      visibility: 'unlisted',
      deletedAt: null,
      unlistedAt: { $ne: null, $lte: daysAgo(UNLISTED_CONTENT_TTL_DAYS) },
    },
    { deletedAt: new Date() }
  ).exec();

  return result.modifiedCount;
};

const warnExpiringUnlisted = async (): Promise<number> => {
  const warnThreshold = daysAgo(
    UNLISTED_CONTENT_TTL_DAYS - UNLISTED_EXPIRY_WARNING_DAYS_BEFORE
  );

  const candidates = await PostModel.find({
    visibility: 'unlisted',
    deletedAt: null,
    unlistedExpiryWarnedAt: null,
    unlistedAt: { $ne: null, $lte: warnThreshold },
  })
    .populate<{ userId: { _id: mongoose.Types.ObjectId; email: string; username: string } }>(
      'userId',
      'email username'
    )
    .exec();

  for (const doc of candidates) {
    const owner = doc.userId as unknown as {
      _id: mongoose.Types.ObjectId;
      email: string;
      username: string;
    };
    const ownerId = getOwnerId(owner);

    await queueGenericEmail({
      to: owner.email,
      subject: `Your unlisted post will be removed soon — ${SITE_NAME}`,
      html: `<p>Hi ${owner.username},</p><p>Your post is unlisted and will be automatically deleted in ${UNLISTED_EXPIRY_WARNING_DAYS_BEFORE} day(s) unless you make it public.</p>`,
    }).catch((e) =>
      logger.warn(e, `Reaper: failed to queue expiry warning email for post ${doc._id.toString()}`)
    );

    const event: IUnlistedExpiryWarningEvent = {
      mediaType: 'post',
      id: doc._id.toString(),
      daysLeft: UNLISTED_EXPIRY_WARNING_DAYS_BEFORE,
    };
    emitToUser(ownerId, UNLISTED_EXPIRY_WARNING_SOCKET_EVENT, event);

    await PostModel.updateOne(
      { _id: doc._id },
      { unlistedExpiryWarnedAt: new Date() }
    ).exec();
  }

  return candidates.length;
};

export const postReaperAdapter: ContentReaperAdapter = {
  contentType: 'post',
  reapExpiredSoftDeletes,
  expireUnlistedContent,
  warnExpiringUnlisted,
};
