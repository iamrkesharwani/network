import type { Request, Response } from 'express';
import type {
  ConversationIdParam,
  MessageDeleteInput,
  MessageIdParam,
  MessageListQuery,
  MessageSendInput,
} from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiPaginatedResponse } from '../../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as messageService from '../services/message.service.js';

const requireUser = (req: Request): { id: string } => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }
  return req.user;
};

export const send = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const result = await messageService.sendMessage(
    user.id,
    req.body as MessageSendInput
  );

  res.status(201).json(new ApiResponse(result, 'Message sent successfully'));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const { conversationId } = req.params as unknown as ConversationIdParam;
  const { cursor, limit } = req.query as unknown as MessageListQuery;

  const result = await messageService.listMessages(
    user.id,
    conversationId,
    cursor ?? null,
    limit
  );

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Messages fetched successfully'
      )
    );
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const { messageId } = req.params as unknown as MessageIdParam;
  const { scope } = req.body as MessageDeleteInput;

  await messageService.deleteMessage(user.id, messageId, scope);

  res.status(200).json(new ApiResponse(null, 'Message deleted successfully'));
});
