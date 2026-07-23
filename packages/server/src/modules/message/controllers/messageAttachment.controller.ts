import type { Request, Response } from 'express';
import type { MessageAttachmentPresignInput } from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as messageAttachmentService from '../services/messageAttachment.service.js';

const requireUser = (req: Request): { id: string } => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }
  return req.user;
};

export const presign = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const result = await messageAttachmentService.presignAttachmentUpload(
    user.id,
    req.body as MessageAttachmentPresignInput
  );

  res.status(201).json(new ApiResponse(result, 'Attachment upload presigned'));
});
