import type { Request, Response } from 'express';
import type {
  KeyBundlePublishInput,
  KeyHistoryRewrapInput,
  KeyRotateInput,
} from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as keyBundleService from '../services/keyBundle.service.js';

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

export const rotate = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const result = await keyBundleService.rotateKeyBundle(
    req.user.id,
    req.body as KeyRotateInput
  );

  res
    .status(200)
    .json(new ApiResponse(result, 'Messaging key rotated successfully'));
});

export const rewrapHistory = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
    }

    await keyBundleService.rewrapKeyHistory(
      req.user.id,
      req.body as KeyHistoryRewrapInput
    );

    res
      .status(200)
      .json(new ApiResponse(null, 'Key history re-wrapped successfully'));
  }
);

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const result = await keyBundleService.getOwnKeyHistory(req.user.id);

  res
    .status(200)
    .json(new ApiResponse(result, 'Key history fetched successfully'));
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
