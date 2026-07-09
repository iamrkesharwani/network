import type { Request, Response } from 'express';
import type { CreatePostInput, PostFinaliseInput } from '@network/shared';
import { ALLOWED_POST_IMAGE_MIME_TYPES } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { verifyFileMagicBytes } from '../../../core/middleware/upload.middleware.js';
import { createPost, finalisePost } from '../services/post.upload.service.js';

export const createThePost = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const data = req.body as CreatePostInput;
    const hasText =
      typeof data.text === 'string' && data.text.trim().length > 0;

    if (!hasText && !req.file) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'A post must contain text or an image attachment.'
      );
    }

    if (req.file) {
      await verifyFileMagicBytes(req.file, ALLOWED_POST_IMAGE_MIME_TYPES);
    }

    const result = await createPost(
      req.user.id,
      data,
      req.file
        ? { buffer: req.file.buffer, mimeType: req.file.mimetype }
        : undefined
    );

    res.status(201).json(new ApiResponse(result, 'Post created successfully'));
  }
);

export const finaliseThePost = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const { postId } = req.params as { postId: string };
    if (!postId)
      throw new ApiError(400, 'VALIDATION_ERROR', 'Post ID is required.');

    const result = await finalisePost(
      postId,
      req.user.id,
      req.body as PostFinaliseInput
    );

    res
      .status(200)
      .json(new ApiResponse(result, 'Post finalised successfully'));
  }
);
