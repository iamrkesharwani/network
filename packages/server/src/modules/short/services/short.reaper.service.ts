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
import { ShortModel } from '../short.model.js';
import {
  storageProvider,
  videoProvider,
  imageProvider,
} from '../../../core/providers/provider.js';
import { emitToUser } from '../../../core/config/socket.js';
import { queueGenericEmail } from '../../email/email.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import { daysAgo } from '../../../core/utils/daysAgo.js';
import { logger } from '../../../core/utils/logger.js';

const reapExpiredSoftDeletes = async (): Promise<number> => {
  const expired = await ShortModel.find({
    deletedAt: { $ne: null, $lte: daysAgo(CONTENT_RETENTION_DAYS) },
  })
    .select('+storageKey')
    .exec();

  for (const doc of expired) {
    if (doc.providerVideoId) {
      await videoProvider
        .deleteVideo(doc.providerVideoId)
        .catch((e) =>
          logger.warn(e, `Reaper: failed to delete provider video ${doc.providerVideoId}`)
        );
    }
    if (doc.storageKey) {
      await storageProvider
        .deleteObject(doc.storageKey)
        .catch((e) =>
          logger.warn(e, `Reaper: failed to delete storage object ${doc.storageKey}`)
        );
    }
    if (doc.thumbnailUrl) {
      await imageProvider
        .deleteImage(doc.thumbnailUrl)
        .catch((e) =>
          logger.warn(e, `Reaper: failed to delete thumbnail ${doc.thumbnailUrl}`)
        );
    }
    await ShortModel.deleteOne({ _id: doc._id }).exec();
  }

  return expired.length;
};

const expireUnlistedContent = async (): Promise<number> => {
  const result = await ShortModel.updateMany(
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

  const candidates = await ShortModel.find({
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
      subject: `Your unlisted short will be removed soon — ${SITE_NAME}`,
      html: `<p>Hi ${owner.username},</p><p>Your short "${doc.title}" is unlisted and will be automatically deleted in ${UNLISTED_EXPIRY_WARNING_DAYS_BEFORE} day(s) unless you make it public.</p>`,
    }).catch((e) =>
      logger.warn(e, `Reaper: failed to queue expiry warning email for short ${doc._id.toString()}`)
    );

    const event: IUnlistedExpiryWarningEvent = {
      mediaType: 'short',
      id: doc._id.toString(),
      title: doc.title,
      daysLeft: UNLISTED_EXPIRY_WARNING_DAYS_BEFORE,
    };
    emitToUser(ownerId, UNLISTED_EXPIRY_WARNING_SOCKET_EVENT, event);

    await ShortModel.updateOne(
      { _id: doc._id },
      { unlistedExpiryWarnedAt: new Date() }
    ).exec();
  }

  return candidates.length;
};

export const shortReaperAdapter: ContentReaperAdapter = {
  contentType: 'short',
  reapExpiredSoftDeletes,
  expireUnlistedContent,
  warnExpiringUnlisted,
};
