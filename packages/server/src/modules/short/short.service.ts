import {
  SHORT_UPLOAD_SESSION_TTL_SECONDS,
  type IInitiateShortUploadResult,
  type IShortResponse,
  type InitiateShortUploadInput,
  type ShortUpdateInput,
  type ShortUploadInput,
} from '@network/shared';
import * as shortRepository from './short.repository.js';
import {
  storageProvider,
  videoProvider,
  imageProvider,
} from '../../providers/provider.js';
import { redisClient } from '../../config/redis.js';
import { logger } from '../../utils/logger.js';
import { ShortModel, type IShortDocument } from './short.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getOwnerId } from '../../utils/getOwnerId.js';
import type { NormalizedWebhookPayload } from '../../providers/types.js';
import type { Requester } from './short.types.js';

const uploadSessionKey = (storageKey: string): string =>
  `short_upload_session:${storageKey}`;

const toResponse = (doc: IShortDocument): IShortResponse =>
  doc.toJSON() as IShortResponse;

const toResponseFromLean = (doc: IShortDocument): IShortResponse =>
  ShortModel.hydrate(doc, undefined, {
    hydratedPopulatedDocs: true,
  }).toJSON() as unknown as IShortResponse;

export const initiateUpload = async (
  userId: string,
  data: InitiateShortUploadInput
): Promise<IInitiateShortUploadResult> => {
  const placeholder = await shortRepository.createPlaceholder(
    userId,
    data.fileName
  );
  const shortId = placeholder._id.toString();

  const { url: presignedUrl, key: storageKey } =
    await storageProvider.presignUpload(
      userId,
      shortId,
      data.mimeType,
      data.fileSizeBytes
    );

  await redisClient.set(
    uploadSessionKey(storageKey),
    `${userId}:${shortId}`,
    'EX',
    SHORT_UPLOAD_SESSION_TTL_SECONDS
  );

  return { shortId, presignedUrl, storageKey };
};

export const confirmUpload = async (
  userId: string,
  shortId: string,
  storageKey: string,
  fileSizeBytes: number
): Promise<IShortResponse> => {
  const sessionValue = await redisClient.get(uploadSessionKey(storageKey));
  if (sessionValue !== `${userId}:${shortId}`) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'This upload session does not belong to you or has expired.'
    );
  }

  if (!storageProvider.isOwnedKey(storageKey, userId, shortId)) {
    throw new ApiError(403, 'FORBIDDEN', 'Invalid storage key.');
  }

  const placeholder = await shortRepository.findById(shortId);
  if (!placeholder) {
    throw new ApiError(404, 'NOT_FOUND', 'Short record not found.');
  }

  const storageUrl = await storageProvider.buildAccessUrl(storageKey);

  const { providerVideoId } = await videoProvider.ingestFromUrl({
    storageUrl,
    fileName: placeholder.title,
    fileSizeBytes,
    userId,
  });

  const short = await shortRepository.updateById(shortId, {
    providerVideoId,
    storageKey,
    status: 'PROCESSING',
  });

  if (!short) {
    throw new ApiError(404, 'NOT_FOUND', 'Short record not found.');
  }

  await redisClient.del(uploadSessionKey(storageKey));
  return toResponse(short);
};

export const uploadThumbnail = async (
  buffer: Buffer,
  mimeType: string
): Promise<string> => imageProvider.uploadImage(buffer, mimeType);

export const finaliseShort = async (
  shortId: string,
  userId: string,
  data: ShortUploadInput
): Promise<IShortResponse> => {
  const short = await shortRepository.findById(shortId);
  if (!short) {
    throw new ApiError(404, 'NOT_FOUND', 'Short not found.');
  }
  if (getOwnerId(short.userId) !== userId) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not own this short.');
  }

  const updated = await shortRepository.updateById(shortId, {
    title: data.title,
    tags: data.tags,
    visibility: data.visibility,
    ...(data.description !== undefined && { description: data.description }),
    ...(data.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
  });

  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Short not found.');
  }

  return toResponse(updated);
};

export const getShortById = async (
  shortId: string,
  requester?: Requester
): Promise<IShortResponse> => {
  const short = await shortRepository.findById(shortId);

  if (!short) throw new ApiError(404, 'NOT_FOUND', 'Short not found.');

  const isOwner = requester?.id === getOwnerId(short.userId);
  const isAdmin = requester?.role === 'admin';
  const canBypassRestrictions = isOwner || isAdmin;

  if (!canBypassRestrictions && short.status !== 'READY')
    throw new ApiError(404, 'NOT_FOUND', 'Short not found.');
  if (!canBypassRestrictions && short.visibility === 'private')
    throw new ApiError(404, 'NOT_FOUND', 'Short not found.');

  if (!isOwner) {
    shortRepository
      .incrementViews(shortId)
      .catch((e) =>
        logger.error(e, `Failed to increment views for short ${shortId}`)
      );
  }

  return toResponse(short);
};

export const getPublicFeed = async (page: number, limit: number) => {
  const result = await shortRepository.findPublicFeed(page, limit);
  return { ...result, data: result.data.map(toResponseFromLean) };
};

export const getMyShorts = async (
  userId: string,
  page: number,
  limit: number
) => {
  const result = await shortRepository.findByUserId(userId, page, limit);
  return { ...result, data: result.data.map(toResponseFromLean) };
};

export const updateShort = async (
  shortId: string,
  requester: Requester,
  data: ShortUpdateInput
): Promise<IShortResponse> => {
  const short = await shortRepository.findById(shortId);
  if (!short) throw new ApiError(404, 'NOT_FOUND', 'Short not found.');

  if (getOwnerId(short.userId) !== requester.id && requester.role !== 'admin') {
    throw new ApiError(403, 'FORBIDDEN', 'You cannot edit this short.');
  }

  const updated = await shortRepository.updateById(shortId, {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.tags !== undefined && { tags: data.tags }),
    ...(data.visibility !== undefined && { visibility: data.visibility }),
  });

  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Short not found.');
  return toResponse(updated);
};

export const deleteShort = async (
  shortId: string,
  requester: Requester
): Promise<void> => {
  const short = await shortRepository.findById(shortId);
  if (!short) throw new ApiError(404, 'NOT_FOUND', 'Short not found.');

  if (getOwnerId(short.userId) !== requester.id && requester.role !== 'admin') {
    throw new ApiError(403, 'FORBIDDEN', 'You cannot delete this short.');
  }

  const deleted = await shortRepository.deleteById(shortId);
  if (!deleted) throw new ApiError(404, 'NOT_FOUND', 'Short not found.');

  if (deleted.providerVideoId) {
    await videoProvider.deleteVideo(deleted.providerVideoId);
  }
  if (deleted.storageKey) {
    await storageProvider.deleteObject(deleted.storageKey);
  }
  if (deleted.thumbnailUrl) {
    await imageProvider
      .deleteImage(deleted.thumbnailUrl)
      .catch((e) =>
        logger.warn(
          e,
          `Failed to delete short thumbnail ${deleted.thumbnailUrl}`
        )
      );
  }
};

export const processWebhook = async (
  payload: NormalizedWebhookPayload
): Promise<void> => {
  const short = await shortRepository.updateByProviderVideoId(
    payload.providerVideoId,
    {
      status: payload.status,
      ...(payload.duration !== undefined && { duration: payload.duration }),
      ...(payload.playbackUrl !== undefined && {
        playbackUrl: payload.playbackUrl,
      }),
      ...(payload.errorMessage !== undefined && {
        errorMessage: payload.errorMessage,
      }),
    }
  );

  if (!short) {
    logger.warn(
      `Webhook for unknown providerVideoId: ${payload.providerVideoId}`
    );
  }
};
