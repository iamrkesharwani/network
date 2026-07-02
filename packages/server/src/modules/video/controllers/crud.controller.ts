import type { Request, Response } from 'express';
import type { VideoFeedQuery, VideoUpdateInput } from '@network/shared';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import * as videoService from '../video.service.js';
import { ApiPaginatedResponse } from '../../../utils/ApiPaginatedResponse.js';
import { ApiError } from '../../../utils/ApiError.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';

const getFeedQuery = (req: Request): VideoFeedQuery =>
  req.query as unknown as VideoFeedQuery;

const getVideoIdParam = (req: Request): string =>
  req.params['videoId'] as string;

export const getFeed = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getFeedQuery(req);
  const result = await videoService.getPublicFeed(page, limit);

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

  const { page, limit } = getFeedQuery(req);
  const result = await videoService.getMyVideos(userId, page, limit);

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

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const video = await videoService.getVideoById(getVideoIdParam(req), req.user);

  res.status(200).json(new ApiResponse(video, 'Video fetched successfully'));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const video = await videoService.updateVideo(
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

  await videoService.deleteVideo(getVideoIdParam(req), req.user);

  res.status(200).json(new ApiResponse(null, 'Video deleted successfully'));
});
