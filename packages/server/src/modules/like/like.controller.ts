import type { Request, Response } from 'express';
import type { EngageableContentType, LikeToggleInput } from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiError } from '../../core/utils/ApiError.js';
import { toggleLike, getLikeStatuses } from './like.service.js';

export const toggle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { contentType, contentId } = req.body as LikeToggleInput;
  const result = await toggleLike(req.user.id, contentType, contentId);

  res.status(200).json(new ApiResponse(result, 'Like toggled successfully'));
});

export const status = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { contentType, contentIds } = req.query as unknown as {
    contentType: EngageableContentType;
    contentIds: string;
  };

  const ids = contentIds
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const result = await getLikeStatuses(req.user.id, contentType, ids);

  res
    .status(200)
    .json(new ApiResponse(result, 'Like statuses fetched successfully'));
});
