import type { Request, Response } from 'express';
import {
  MESSAGE_ATTACHMENT_TYPES,
  ALLOWED_MESSAGE_IMAGE_MIME_TYPES,
  ALLOWED_MESSAGE_VOICE_MIME_TYPES,
  MESSAGE_ATTACHMENT_MAX_VOICE_DURATION_MS,
  type MessageAttachmentType,
} from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { verifyFileMagicBytes } from '../../../core/middleware/upload.middleware.js';
import * as messageAttachmentService from '../services/messageAttachment.service.js';

const requireUser = (req: Request): { id: string } => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }
  return req.user;
};

const requireAttachmentType = (value: unknown): MessageAttachmentType => {
  if (!MESSAGE_ATTACHMENT_TYPES.includes(value as MessageAttachmentType)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid attachment type.');
  }
  return value as MessageAttachmentType;
};

export const upload = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const { conversationId, type, duration } = req.body as {
    conversationId?: string;
    type?: string;
    duration?: string;
  };

  if (!conversationId) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'conversationId is required.');
  }
  const attachmentType = requireAttachmentType(type);
  if (!req.file) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'No file uploaded.');
  }

  await verifyFileMagicBytes(
    req.file,
    attachmentType === 'image'
      ? ALLOWED_MESSAGE_IMAGE_MIME_TYPES
      : ALLOWED_MESSAGE_VOICE_MIME_TYPES
  );

  const parsedDuration = duration !== undefined ? Number(duration) : undefined;
  if (
    parsedDuration !== undefined &&
    (!Number.isFinite(parsedDuration) ||
      parsedDuration < 0 ||
      parsedDuration > MESSAGE_ATTACHMENT_MAX_VOICE_DURATION_MS)
  ) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid attachment duration.');
  }

  const result = await messageAttachmentService.uploadAttachment(
    user.id,
    conversationId,
    req.file,
    attachmentType,
    parsedDuration
  );

  res.status(201).json(new ApiResponse(result, 'Attachment uploaded'));
});
