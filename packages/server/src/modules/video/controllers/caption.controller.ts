import type { Request, Response } from 'express';
import type { CaptionUploadInput } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { verifyVttContent } from '../../../core/middleware/upload.middleware.js';
import {
  addCaption,
  removeCaption,
  setDefaultCaption,
} from '../services/video.caption.service.js';

const getVideoIdParam = (req: Request): string =>
  req.params['videoId'] as string;

const getCaptionIdParam = (req: Request): string =>
  req.params['captionId'] as string;

export const uploadTheCaption = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    if (!req.file) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'No caption file provided.');
    }

    verifyVttContent(req.file.buffer);

    const result = await addCaption(
      getVideoIdParam(req),
      req.user,
      req.file,
      req.body as CaptionUploadInput
    );

    res
      .status(201)
      .json(new ApiResponse(result, 'Caption uploaded successfully'));
  }
);

export const deleteTheCaption = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const result = await removeCaption(
      getVideoIdParam(req),
      getCaptionIdParam(req),
      req.user
    );

    res
      .status(200)
      .json(new ApiResponse(result, 'Caption deleted successfully'));
  }
);

export const setTheDefaultCaption = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const result = await setDefaultCaption(
      getVideoIdParam(req),
      getCaptionIdParam(req),
      req.user
    );

    res
      .status(200)
      .json(new ApiResponse(result, 'Default caption updated successfully'));
  }
);
