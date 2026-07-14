import type { Request, Response } from 'express';
import type { CaptionUploadInput } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import {
  addCaption,
  removeCaption,
  setDefaultCaption,
} from '../services/video.caption.service.js';
import { getVideoIdParam, getCaptionIdParam } from './params.js';

const UTF8_BOM = '﻿';

const verifyVttContent = (buffer: Buffer): void => {
  const text = buffer.toString('utf-8');
  const withoutBom = text.startsWith(UTF8_BOM)
    ? text.slice(UTF8_BOM.length)
    : text;

  if (!withoutBom.startsWith('WEBVTT')) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'File content is not a valid WebVTT caption file.'
    );
  }
};

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
