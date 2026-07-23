import type {
  IShortResponse,
  ShortUpdateInput,
  ContentVisibility,
} from '@network/shared';
import * as shortRepository from '../short.repository.js';
import type { IShortDocument } from '../short.model.js';
import { logger } from '../../../core/utils/logger.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import { buildVisibilityFields } from '../../../core/utils/buildVisibilityFields.js';
import type { Requester } from '../short.types.js';
import { toResponse, toResponseFromLean } from './short.mappers.js';
import { recordViewIncrement } from '../../creator/services/creator.views.service.js';
import {
  resolveProfileAccess,
  getContentOwnerAccess,
  getAccessibleAuthorIds,
} from '../../user/services/user.profile.service.js';
import { queueMentionDiffNotifications } from '../../notification/notification.mention.service.js';

export const getUserVisibilityCounts = async (
  username: string,
  requesterId: string | undefined
) => {
  const { userId, isOwner } = await resolveProfileAccess(username, requesterId);
  if (!isOwner) {
    throw new ApiError(403, 'FORBIDDEN', 'You cannot view these counts.');
  }
  return shortRepository.countByVisibility(userId);
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
  if (!canBypassRestrictions && short.visibility !== 'public')
    throw new ApiError(404, 'NOT_FOUND', 'Short not found.');

  if (!canBypassRestrictions) {
    const access = await getContentOwnerAccess(
      getOwnerId(short.userId),
      requester?.id
    );
    if (access.blocked) throw new ApiError(404, 'NOT_FOUND', 'Short not found.');
    if (access.isPrivate && !access.hasAccess) {
      throw new ApiError(403, 'PRIVATE_ACCOUNT', 'This account is private.');
    }
  }

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

const filterByAuthorAccess = async (
  docs: IShortDocument[],
  viewerId: string | undefined
): Promise<IShortDocument[]> => {
  const accessibleAuthorIds = await getAccessibleAuthorIds(
    docs.map((doc) => getOwnerId(doc.userId)),
    viewerId
  );
  return docs.filter((doc) => accessibleAuthorIds.has(getOwnerId(doc.userId)));
};

export const getPublicFeed = async (
  cursor: string | null,
  limit: number,
  viewerId?: string
) => {
  const result = await shortRepository.findPublicFeed(cursor, limit);
  const visible = await filterByAuthorAccess(result.data, viewerId);
  return { ...result, data: visible.map(toResponseFromLean) };
};

export const searchPublic = async (
  q: string,
  cursor: string | null,
  limit: number,
  viewerId?: string
) => {
  const result = await shortRepository.searchPublic(q, cursor, limit);
  const visible = await filterByAuthorAccess(result.data, viewerId);
  return { ...result, data: visible.map(toResponseFromLean) };
};

export const findByIds = async (
  ids: string[],
  viewerId?: string
): Promise<IShortResponse[]> => {
  const docs = await shortRepository.findByIds(ids);
  const visible = await filterByAuthorAccess(docs, viewerId);
  return visible.map(toResponse);
};

export const getRelatedShorts = async (
  tags: string[],
  cursor: string | null,
  limit: number
) => {
  const result = await shortRepository.findRelated(tags, cursor, limit);
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
  const { userId, isOwner, hasAccess } = await resolveProfileAccess(
    username,
    requesterId
  );

  if (!hasAccess) {
    return { data: [], meta: { nextCursor: null, hasNextPage: false, limit } };
  }

  const extraFilter = isOwner
    ? { ...(visibilityQuery !== undefined && { visibility: visibilityQuery }) }
    : {
        visibility: 'public',
        status: 'READY',
        moderationStatus: { $nin: ['jury_removed', 'admin_removed'] },
      };

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

  if (data.description !== undefined) {
    await queueMentionDiffNotifications(short.description ?? '', data.description, {
      actorId: requester.id,
      targetType: 'short',
      targetId: shortId,
    });
  }

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
