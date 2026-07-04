import type { Request, Response } from 'express';
import type {
  InitiateShortUploadInput,
  ShortUploadInput,
  ConfirmShortUploadInput,
} from '@network/shared';
import { ALLOWED_THUMBNAIL_MIME_TYPES } from '@network/shared';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { ApiError } from '../../../utils/ApiError.js';
import { verifyFileMagicBytes } from '../../../middleware/upload.middleware.js';
import * as shortService from '../short.service.js';

export const initiateUpload = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const result = await shortService.initiateUpload(
      req.user.id,
      req.body as InitiateShortUploadInput
    );

    res
      .status(201)
      .json(new ApiResponse(result, 'Upload session created successfully'));
  }
);

export const confirmUpload = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const { shortId, storageKey, fileSizeBytes } =
      req.body as ConfirmShortUploadInput;

    const short = await shortService.confirmUpload(
      req.user.id,
      shortId,
      storageKey,
      fileSizeBytes
    );

    res
      .status(200)
      .json(new ApiResponse(short, 'Upload confirmed. Processing started.'));
  }
);

export const uploadThumbnail = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'No thumbnail file provided.'
      );
    }

    await verifyFileMagicBytes(req.file, ALLOWED_THUMBNAIL_MIME_TYPES);

    const thumbnailUrl = await shortService.uploadThumbnail(
      req.file.buffer,
      req.file.mimetype
    );

    res
      .status(201)
      .json(
        new ApiResponse({ thumbnailUrl }, 'Thumbnail uploaded successfully')
      );
  }
);

export const finaliseShort = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const { shortId } = req.params as { shortId: string };
    if (!shortId)
      throw new ApiError(400, 'VALIDATION_ERROR', 'Short ID is required.');

    const short = await shortService.finaliseShort(
      shortId,
      req.user.id,
      req.body as ShortUploadInput
    );

    res
      .status(200)
      .json(new ApiResponse(short, 'Short finalised successfully'));
  }
);
