import type { Request, Response } from 'express';
import type {
  PlaylistContainingQuery,
  PlaylistCreateInput,
  PlaylistFeedQuery,
  PlaylistItemAddInput,
  PlaylistItemsQuery,
  PlaylistReorderInput,
  PlaylistUpdateInput,
} from '@network/shared';
import { ALLOWED_PLAYLIST_COVER_MIME_TYPES } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiPaginatedResponse } from '../../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { verifyFileMagicBytes } from '../../../core/middleware/upload.middleware.js';
import * as playlistService from '../services/playlist.service.js';
import { getPlaylistIdParam, getItemIdParam, getUsernameParam } from './params.js';

const getFeedQuery = (req: Request): PlaylistFeedQuery =>
  req.query as unknown as PlaylistFeedQuery;

const getItemsQuery = (req: Request): PlaylistItemsQuery =>
  req.query as unknown as PlaylistItemsQuery;

const getContainingQuery = (req: Request): PlaylistContainingQuery =>
  req.query as unknown as PlaylistContainingQuery;

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const playlist = await playlistService.createPlaylist(
    req.user.id,
    req.body as PlaylistCreateInput
  );

  res.status(201).json(new ApiResponse(playlist, 'Playlist created successfully'));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { cursor, limit } = getFeedQuery(req);
  const result = await playlistService.getMyPlaylists(
    req.user.id,
    cursor ?? null,
    limit
  );

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(result.data, result.meta, 'Playlists fetched successfully')
    );
});

export const getByUsername = asyncHandler(
  async (req: Request, res: Response) => {
    const { cursor, limit } = getFeedQuery(req);
    const result = await playlistService.getUserPlaylists(
      getUsernameParam(req),
      cursor ?? null,
      limit
    );

    res
      .status(200)
      .json(
        new ApiPaginatedResponse(
          result.data,
          result.meta,
          "User's playlists fetched successfully"
        )
      );
  }
);

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const playlist = await playlistService.getPlaylistDetail(
    getPlaylistIdParam(req)
  );

  res.status(200).json(new ApiResponse(playlist, 'Playlist fetched successfully'));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const playlist = await playlistService.updatePlaylist(
    getPlaylistIdParam(req),
    req.user.id,
    req.body as PlaylistUpdateInput
  );

  res.status(200).json(new ApiResponse(playlist, 'Playlist updated successfully'));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  await playlistService.deletePlaylist(getPlaylistIdParam(req), req.user.id);

  res.status(200).json(new ApiResponse(null, 'Playlist deleted successfully'));
});

export const listItems = asyncHandler(async (req: Request, res: Response) => {
  const { cursor, limit } = getItemsQuery(req);
  const result = await playlistService.getPlaylistItems(
    getPlaylistIdParam(req),
    cursor ?? null,
    limit
  );

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Playlist items fetched successfully'
      )
    );
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { contentType, contentId } = req.body as PlaylistItemAddInput;
  await playlistService.addItemToPlaylist(
    getPlaylistIdParam(req),
    req.user.id,
    contentType,
    contentId
  );

  res.status(200).json(new ApiResponse(null, 'Content added to playlist'));
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  await playlistService.removeItemFromPlaylist(
    getPlaylistIdParam(req),
    req.user.id,
    getItemIdParam(req)
  );

  res.status(200).json(new ApiResponse(null, 'Content removed from playlist'));
});

export const reorder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { itemId, toIndex } = req.body as PlaylistReorderInput;
  await playlistService.reorderPlaylistItems(
    getPlaylistIdParam(req),
    req.user.id,
    itemId,
    toIndex
  );

  res.status(200).json(new ApiResponse(null, 'Playlist reordered successfully'));
});

export const uploadCover = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const file = req.file;
  if (!file) throw new ApiError(400, 'VALIDATION_ERROR', 'No file uploaded.');

  await verifyFileMagicBytes(file, ALLOWED_PLAYLIST_COVER_MIME_TYPES);

  const playlist = await playlistService.uploadPlaylistCover(
    getPlaylistIdParam(req),
    req.user.id,
    file.buffer,
    file.mimetype
  );

  res.status(200).json(new ApiResponse(playlist, 'Playlist cover updated successfully'));
});

export const removeCover = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const playlist = await playlistService.removePlaylistCover(
    getPlaylistIdParam(req),
    req.user.id
  );

  res.status(200).json(new ApiResponse(playlist, 'Playlist cover removed successfully'));
});

export const getContaining = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { contentType, contentId } = getContainingQuery(req);
  const result = await playlistService.getContainingPlaylists(
    req.user.id,
    contentType,
    contentId
  );

  res
    .status(200)
    .json(new ApiResponse(result, 'Containing playlists fetched successfully'));
});
