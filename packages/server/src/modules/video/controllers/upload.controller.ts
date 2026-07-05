import type { Request, Response } from 'express';
import type {
  InitiateVideoUploadInput,
  VideoUploadInput,
  ConfirmVideoUploadInput,
} from '@network/shared';
import { ALLOWED_THUMBNAIL_MIME_TYPES } from '@network/shared';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { ApiError } from '../../../utils/ApiError.js';
import { verifyFileMagicBytes } from '../../../middleware/upload.middleware.js';

export const initiateTheUpload = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const result = await initiateUpload(
      userId,
      req.body as InitiateVideoUploadInput
    );

    res
      .status(201)
      .json(new ApiResponse(result, 'Upload session created successfully'));
  }
);

export const confirmTheUpload = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const { videoId, storageKey, fileSizeBytes } =
      req.body as ConfirmVideoUploadInput;

    const result = await videoService.confirmUpload(
      userId,
      videoId,
      storageKey,
      fileSizeBytes
    );

    res
      .status(200)
      .json(new ApiResponse(result, 'Upload confirmed. Processing started.'));
  }
);

export const uploadTheThumbnail = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'No thumbnail file provided.'
      );
    }

    await verifyFileMagicBytes(req.file, ALLOWED_THUMBNAIL_MIME_TYPES);

    const thumbnailUrl = await videoService.uploadThumbnail(
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

export const finaliseTheVideo = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const { videoId } = req.params as { videoId: string };
    if (!videoId)
      throw new ApiError(400, 'VALIDATION_ERROR', 'Video ID is required.');

    const result = await videoService.finaliseVideo(
      videoId,
      userId,
      req.body as VideoUploadInput
    );

    res
      .status(200)
      .json(new ApiResponse(result, 'Video finalised successfully'));
  }
);
