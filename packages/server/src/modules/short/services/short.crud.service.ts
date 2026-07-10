import type {
  IShortResponse,
  ShortUpdateInput,
  ContentVisibility,
} from '@network/shared';
import * as shortRepository from '../short.repository.js';
import { logger } from '../../../core/utils/logger.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import { buildVisibilityFields } from '../../../core/utils/buildVisibilityFields.js';
import type { Requester } from '../short.types.js';
import { toResponse, toResponseFromLean } from './short.mappers.js';
import { recordViewIncrement } from '../../creator/services/creator.views.service.js';
import { resolveProfileOwner } from '../../user/services/user.profile.service.js';

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
  if (!canBypassRestrictions && short.visibility !== 'public')
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

export const getPublicFeed = async (cursor: string | null, limit: number) => {
  const result = await shortRepository.findPublicFeed(cursor, limit);
  return { ...result, data: result.data.map(toResponseFromLean) };
};

export const getMyShorts = async (
  userId: string,
  cursor: string | null,
  limit: number
) => {
  const result = await shortRepository.findByUserId(userId, cursor, limit);
  return { ...result, data: result.data.map(toResponseFromLean) };
};

export const getUserShorts = async (
  username: string,
  requesterId: string | undefined,
  cursor: string | null,
  limit: number,
  visibilityQuery?: ContentVisibility
) => {
  const { userId, isOwner } = await resolveProfileOwner(username, requesterId);

  const extraFilter = isOwner
    ? { ...(visibilityQuery !== undefined && { visibility: visibilityQuery }) }
    : { visibility: 'public', status: 'READY' };

  const result = await shortRepository.findByUserId(
    userId,
    cursor,
    limit,
    extraFilter
  );
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
    ...buildVisibilityFields(data.visibility),
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

  const deleted = await shortRepository.softDeleteById(shortId);
  if (!deleted) throw new ApiError(404, 'NOT_FOUND', 'Short not found.');
};
