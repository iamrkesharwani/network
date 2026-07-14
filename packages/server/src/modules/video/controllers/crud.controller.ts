import type { Request, Response } from 'express';
import type { VideoFeedQuery, VideoUpdateInput, VideoUserFeedQuery } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiPaginatedResponse } from '../../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import {
  deleteVideo,
  getMyVideos,
  getPublicFeed,
  getUserVideos,
  getUserVisibilityCounts,
  getVideoById,
  updateVideo,
} from '../services/video.crud.service.js';
import { getVideoIdParam, getUsernameParam } from './params.js';

const getFeedQuery = (req: Request): VideoFeedQuery =>
  req.query as unknown as VideoFeedQuery;

const getUserFeedQuery = (req: Request): VideoUserFeedQuery =>
  req.query as unknown as VideoUserFeedQuery;

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const { cursor, limit } = getFeedQuery(req);
  const result = await getPublicFeed(cursor ?? null, limit);

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Feed fetched successfully'
      )
    );
});

export const getMine = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { cursor, limit } = getFeedQuery(req);
  const result = await getMyVideos(userId, cursor ?? null, limit);

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Your videos fetched successfully'
      )
    );
});

export const getByUsername = asyncHandler(
  async (req: Request, res: Response) => {
    const { cursor, limit, visibility } = getUserFeedQuery(req);
    const result = await getUserVideos(
      getUsernameParam(req),
      req.user?.id,
      cursor ?? null,
      limit,
      visibility
    );

    res
      .status(200)
      .json(
        new ApiPaginatedResponse(
          result.data,
          result.meta,
          "User's videos fetched successfully"
        )
      );
  }
);

export const getVisibilityCounts = asyncHandler(
  async (req: Request, res: Response) => {
    const counts = await getUserVisibilityCounts(
      getUsernameParam(req),
      req.user?.id
    );

    res.status(200).json(new ApiResponse(counts, 'Visibility counts fetched successfully'));
  }
);

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const video = await getVideoById(getVideoIdParam(req), req.user);

  res.status(200).json(new ApiResponse(video, 'Video fetched successfully'));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const video = await updateVideo(
    getVideoIdParam(req),
    req.user,
    req.body as VideoUpdateInput
  );

  res.status(200).json(new ApiResponse(video, 'Video updated successfully'));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  await deleteVideo(getVideoIdParam(req), req.user);

  res.status(200).json(new ApiResponse(null, 'Video deleted successfully'));
});
