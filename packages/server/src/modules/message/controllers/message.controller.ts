import type { Request, Response } from 'express';
import type {
  ConversationIdParam,
  MessageDeleteInput,
  MessageIdParam,
  MessageListQuery,
  MessageSendInput,
  MessageReactionSetInput,
  MessageEditInput,
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

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const { messageId } = req.params as unknown as MessageIdParam;

  const result = await messageService.getMessageById(user.id, messageId);

  res.status(200).json(new ApiResponse(result, 'Message fetched successfully'));
});

export const setReaction = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const { messageId } = req.params as unknown as MessageIdParam;

  const result = await messageService.setReaction(
    user.id,
    messageId,
    req.body as MessageReactionSetInput
  );

  res.status(200).json(new ApiResponse(result, 'Reaction set successfully'));
});

export const removeReaction = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { messageId } = req.params as unknown as MessageIdParam;

    await messageService.removeReaction(user.id, messageId);

    res
      .status(200)
      .json(new ApiResponse(null, 'Reaction removed successfully'));
  }
);

export const edit = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const { messageId } = req.params as unknown as MessageIdParam;

  const result = await messageService.editMessage(
    user.id,
    messageId,
    req.body as MessageEditInput
  );

  res.status(200).json(new ApiResponse(result, 'Message edited successfully'));
});
