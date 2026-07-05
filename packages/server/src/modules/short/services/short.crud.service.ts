import type { IShortResponse, ShortUpdateInput } from '@network/shared';
import * as shortRepository from '../short.repository.js';
import {
  storageProvider,
  videoProvider,
  imageProvider,
} from '../../../providers/provider.js';
import { logger } from '../../../utils/logger.js';
import { ApiError } from '../../../utils/ApiError.js';
import { getOwnerId } from '../../../utils/getOwnerId.js';
import type { Requester } from '../short.types.js';
import { toResponse, toResponseFromLean } from './short.mappers.js';
import { recordViewIncrement } from '../../creator/services/creator.views.service.js';

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
      .then((updated) => {
        if (!updated) return;
        return recordViewIncrement(
          getOwnerId(updated.userId),
          shortId,
          updated.views
        );
      })
      .catch((e) =>
        logger.error(
          e,
          `Failed to increment views/creator metrics for short ${shortId}`
        )
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
