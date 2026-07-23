import type {
  ContentVisibility,
  IPlaylistContainingEntry,
  IPlaylistDetail,
  IPlaylistItemResponse,
  IPlaylistSummary,
  PaginatedResponse,
  PlaylistContentType,
  PlaylistCreateInput,
  PlaylistUpdateInput,
} from '@network/shared';
import * as playlistRepository from '../repository/playlist.repository.js';
import * as playlistItemRepository from '../repository/playlistItem.repository.js';
import { getModerationContentAdapter } from '../../../core/moderation/moderationContent.registry.js';
import {
  resolveProfileAccess,
  getContentOwnerAccess,
} from '../../user/services/user.profile.service.js';
import { imageProvider } from '../../../core/providers/provider.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import { toItemResponse, toPlaylistDetail, toPlaylistSummary } from './playlist.mappers.js';
import type { IPlaylistDocument } from '../playlist.model.js';
import type { Requester } from '../playlist.types.js';

const requireOwnedPlaylist = async (
  playlistId: string,
  userId: string
): Promise<IPlaylistDocument> => {
  const playlist = await playlistRepository.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, 'NOT_FOUND', 'Playlist not found.');
  }
  if (playlist.userId.toString() !== userId) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'You do not have access to this playlist.'
    );
  }
  return playlist;
};

export const createPlaylist = async (
  userId: string,
  input: PlaylistCreateInput
): Promise<IPlaylistSummary> => {
  const playlist = await playlistRepository.create(userId, input);
  return toPlaylistSummary(playlist);
};

const listPlaylistsForUser = async (
  userId: string,
  cursor: string | null,
  limit: number,
  extraFilter: Record<string, unknown> = {}
): Promise<Omit<PaginatedResponse<IPlaylistSummary>, 'success' | 'message'>> => {
  const { data, meta } = await playlistRepository.findByUserPaginated(
    userId,
    cursor,
    limit,
    extraFilter
  );

  const thumbnailsByPlaylistId =
    await playlistItemRepository.findFirstItemsByPlaylistIds(
      data.map((doc) => doc._id.toString())
    );

  return {
    data: data.map((doc) =>
      toPlaylistSummary(doc, thumbnailsByPlaylistId.get(doc._id.toString()))
    ),
    meta,
  };
};

export const getMyPlaylists = (
  userId: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IPlaylistSummary>, 'success' | 'message'>> =>
  listPlaylistsForUser(userId, cursor, limit);

export const getUserPlaylists = async (
  username: string,
  requesterId: string | undefined,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IPlaylistSummary>, 'success' | 'message'>> => {
  const { userId, isOwner, hasAccess } = await resolveProfileAccess(
    username,
    requesterId
  );

  if (!hasAccess) {
    return { data: [], meta: { nextCursor: null, hasNextPage: false, limit } };
  }

  const extraFilter = isOwner ? {} : { visibility: 'public' as ContentVisibility };
  return listPlaylistsForUser(userId, cursor, limit, extraFilter);
};

export const getPlaylistDetail = async (
  playlistId: string,
  requester?: Requester
): Promise<IPlaylistDetail> => {
  const playlist = await playlistRepository.findByIdWithAuthor(playlistId);
  if (!playlist) {
    throw new ApiError(404, 'NOT_FOUND', 'Playlist not found.');
  }

  const isOwner = requester?.id === getOwnerId(playlist.userId);
  const isAdmin = requester?.role === 'admin';
  const canBypassRestrictions = isOwner || isAdmin;

  if (!canBypassRestrictions && playlist.visibility !== 'public') {
    throw new ApiError(404, 'NOT_FOUND', 'Playlist not found.');
  }

  if (!canBypassRestrictions) {
    const access = await getContentOwnerAccess(
      getOwnerId(playlist.userId),
      requester?.id
    );
    if (access.blocked) throw new ApiError(404, 'NOT_FOUND', 'Playlist not found.');
    if (access.isPrivate && !access.hasAccess) {
      throw new ApiError(403, 'PRIVATE_ACCOUNT', 'This account is private.');
    }
  }

  const thumbnailsByPlaylistId =
    await playlistItemRepository.findFirstItemsByPlaylistIds([playlistId]);

  return toPlaylistDetail(playlist, thumbnailsByPlaylistId.get(playlistId));
};

export const updatePlaylist = async (
  playlistId: string,
  userId: string,
  input: PlaylistUpdateInput
): Promise<IPlaylistSummary> => {
  await requireOwnedPlaylist(playlistId, userId);
  const updated = await playlistRepository.update(playlistId, input);
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Playlist not found.');
  }
  return toPlaylistSummary(updated);
};

const getFallbackThumbnail = async (
  playlistId: string
): Promise<string | undefined> => {
  const thumbnailsByPlaylistId =
    await playlistItemRepository.findFirstItemsByPlaylistIds([playlistId]);
  return thumbnailsByPlaylistId.get(playlistId);
};

export const uploadPlaylistCover = async (
  playlistId: string,
  userId: string,
  buffer: Buffer,
  mimeType: string
): Promise<IPlaylistSummary> => {
  const playlist = await requireOwnedPlaylist(playlistId, userId);
  const previousCoverImageUrl = playlist.coverImageUrl;

  const coverImageUrl = await imageProvider.uploadImage(buffer, mimeType);
  const updated = await playlistRepository.setCoverImage(
    playlistId,
    coverImageUrl
  );
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Playlist not found.');
  }

  if (previousCoverImageUrl) {
    await imageProvider.deleteImage(previousCoverImageUrl);
  }

  return toPlaylistSummary(updated, await getFallbackThumbnail(playlistId));
};

export const removePlaylistCover = async (
  playlistId: string,
  userId: string
): Promise<IPlaylistSummary> => {
  const playlist = await requireOwnedPlaylist(playlistId, userId);
  const previousCoverImageUrl = playlist.coverImageUrl;

  const updated = await playlistRepository.removeCoverImage(playlistId);
  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Playlist not found.');
  }

  if (previousCoverImageUrl) {
    await imageProvider.deleteImage(previousCoverImageUrl);
  }

  return toPlaylistSummary(updated, await getFallbackThumbnail(playlistId));
};

export const deletePlaylist = async (
  playlistId: string,
  userId: string
): Promise<void> => {
  const playlist = await requireOwnedPlaylist(playlistId, userId);
  await playlistItemRepository.deleteAllByPlaylistId(playlistId);
  await playlistRepository.deleteById(playlistId);

  if (playlist.coverImageUrl) {
    await imageProvider.deleteImage(playlist.coverImageUrl);
  }
};

export const getPlaylistItems = async (
  playlistId: string,
  cursor: string | null,
  limit: number
): Promise<
  Omit<PaginatedResponse<IPlaylistItemResponse>, 'success' | 'message'>
> => {
  const playlist = await playlistRepository.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, 'NOT_FOUND', 'Playlist not found.');
  }

  const { data, meta } = await playlistItemRepository.findItemsPaginated(
    playlistId,
    cursor,
    limit
  );

  return {
    data: data.map(toItemResponse).filter((item) => item !== null),
    meta,
  };
};

export const addItemToPlaylist = async (
  playlistId: string,
  userId: string,
  contentType: PlaylistContentType,
  contentId: string
): Promise<void> => {
  const playlist = await requireOwnedPlaylist(playlistId, userId);

  const moderationAdapter = getModerationContentAdapter(contentType);
  if (!moderationAdapter) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      `Adding ${contentType} content to a playlist is not available yet.`
    );
  }

  const { exists } = await moderationAdapter.lookup(contentId);
  if (!exists) {
    throw new ApiError(404, 'NOT_FOUND', 'Content not found.');
  }

  const { created } = await playlistItemRepository.addItem(
    playlistId,
    contentType,
    contentId,
    playlist.itemCount
  );

  if (created) {
    await playlistRepository.incrementItemCount(playlistId, 1);
  }
};

export const removeItemFromPlaylist = async (
  playlistId: string,
  userId: string,
  itemId: string
): Promise<void> => {
  await requireOwnedPlaylist(playlistId, userId);

  const removed = await playlistItemRepository.removeItem(itemId);
  if (!removed) {
    throw new ApiError(404, 'NOT_FOUND', 'Playlist item not found.');
  }

  await playlistRepository.incrementItemCount(playlistId, -1);
};

export const reorderPlaylistItems = async (
  playlistId: string,
  userId: string,
  itemId: string,
  toIndex: number
): Promise<void> => {
  const playlist = await requireOwnedPlaylist(playlistId, userId);

  const item = await playlistItemRepository.findItemById(itemId);
  if (!item || item.playlistId.toString() !== playlistId) {
    throw new ApiError(404, 'NOT_FOUND', 'Playlist item not found.');
  }

  const clampedIndex = Math.min(
    Math.max(0, toIndex),
    Math.max(0, playlist.itemCount - 1)
  );

  await playlistItemRepository.reorder(
    playlistId,
    itemId,
    item.position,
    clampedIndex
  );
};

export const getContainingPlaylists = async (
  userId: string,
  contentType: PlaylistContentType,
  contentId: string
): Promise<IPlaylistContainingEntry[]> => {
  const { data: playlists } = await playlistRepository.findByUserPaginated(
    userId,
    null,
    100
  );

  const containingByPlaylistId = await playlistItemRepository.findContaining(
    playlists.map((doc) => doc._id.toString()),
    contentType,
    contentId
  );

  return playlists.map((doc) => {
    const itemId = containingByPlaylistId.get(doc._id.toString());
    return {
      playlistId: doc._id.toString(),
      title: doc.title,
      contains: itemId !== undefined,
      ...(itemId !== undefined && { itemId }),
    };
  });
};
