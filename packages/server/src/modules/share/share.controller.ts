import type { Request, Response } from 'express';
import type { ShareCreateInput } from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { createShare } from './share.service.js';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const { contentType, contentId } = req.body as ShareCreateInput;
  const sharerId = req.user?.id ?? null;

  const result = await createShare(sharerId, contentType, contentId);

  res
    .status(201)
    .json(new ApiResponse(result, 'Share link created successfully'));
});
