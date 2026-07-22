import type { Request, Response } from 'express';
import type { KeyBundlePublishInput } from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiError } from '../../core/utils/ApiError.js';
import * as keyBundleService from './keyBundle.service.js';

export const publish = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const result = await keyBundleService.publishKeyBundle(
    req.user.id,
    req.body as KeyBundlePublishInput
  );

  res
    .status(200)
    .json(new ApiResponse(result, 'Messaging key published successfully'));
});

export const getMine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const result = await keyBundleService.getOwnKeyBundle(req.user.id);

  res
    .status(200)
    .json(new ApiResponse(result, 'Messaging key fetched successfully'));
});

export const getPublicKey = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const { userId } = req.params as { userId: string };
    const result = await keyBundleService.getPublicKey(userId);

    res
      .status(200)
      .json(new ApiResponse(result, 'Public key fetched successfully'));
  }
);

export const getPublicKeys = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    const { userIds } = req.query as unknown as { userIds: string };
    const ids = userIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    const result = await keyBundleService.getPublicKeys(ids);

    res
      .status(200)
      .json(new ApiResponse(result, 'Public keys fetched successfully'));
  }
);
