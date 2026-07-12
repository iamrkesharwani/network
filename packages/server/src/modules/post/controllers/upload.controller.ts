import type { Request, Response } from 'express';
import type { CreatePostInput } from '@network/shared';
import { ALLOWED_POST_IMAGE_MIME_TYPES } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { verifyFileMagicBytes } from '../../../core/middleware/upload.middleware.js';
import { createPost } from '../services/post.upload.service.js';

export const createThePost = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user)
      throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');

    const data = req.body as CreatePostInput;
    const hasText =
      typeof data.text === 'string' && data.text.trim().length > 0;
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (!hasText && files.length === 0) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'A post must contain text or an image attachment.'
      );
    }

    for (const file of files) {
      await verifyFileMagicBytes(file, ALLOWED_POST_IMAGE_MIME_TYPES);
    }

    const result = await createPost(
      req.user.id,
      data,
      files.map((file) => ({ buffer: file.buffer, mimeType: file.mimetype }))
    );

    res.status(201).json(new ApiResponse(result, 'Post created successfully'));
  }
);
