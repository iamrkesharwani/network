import type { Request, Response } from 'express';
import {
  ALLOWED_AVATAR_MIME_TYPES,
  type ConversationListQuery,
  type ConversationSearchQuery,
  type ConversationMuteInput,
  type ConversationDisappearingTtlInput,
  type DirectConversationCreateInput,
  type GroupConversationCreateInput,
  type GroupUpdateInput,
  type ParticipantAddInput,
} from '@network/shared';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../../core/utils/ApiResponse.js';
import { ApiPaginatedResponse } from '../../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { verifyFileMagicBytes } from '../../../core/middleware/upload.middleware.js';
import * as conversationService from '../services/conversation.service.js';

const requireUser = (req: Request): { id: string } => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }
  return req.user;
};

export const createDirect = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { participantId } = req.body as DirectConversationCreateInput;

    const result = await conversationService.createDirectConversation(
      user.id,
      participantId
    );

    res.status(200).json(new ApiResponse(result, 'Conversation ready'));
  }
);

export const createGroup = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const result = await conversationService.createGroupConversation(
    user.id,
    req.body as GroupConversationCreateInput
  );

  res.status(201).json(new ApiResponse(result, 'Group created successfully'));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const { cursor, limit } = req.query as unknown as ConversationListQuery;

  const result = await conversationService.listConversations(
    user.id,
    cursor ?? null,
    limit
  );

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Conversations fetched successfully'
      )
    );
});

export const search = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const { q, limit } = req.query as unknown as ConversationSearchQuery;

  const result = await conversationService.searchConversations(user.id, q, limit);

  res.status(200).json(new ApiResponse(result, 'Conversations found'));
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);

  await conversationService.markAllAsRead(user.id);

  res.status(200).json(new ApiResponse(null, 'All conversations marked as read'));
});

export const listArchived = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const { cursor, limit } = req.query as unknown as ConversationListQuery;

  const result = await conversationService.listArchivedConversations(
    user.id,
    cursor ?? null,
    limit
  );

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Archived conversations fetched successfully'
      )
    );
});

export const addParticipants = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { conversationId } = req.params as { conversationId: string };
    const { participantIds } = req.body as ParticipantAddInput;

    const result = await conversationService.addParticipants(
      user.id,
      conversationId,
      participantIds
    );

    res
      .status(200)
      .json(new ApiResponse(result, 'Participants added successfully'));
  }
);

export const updateGroupMeta = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { conversationId } = req.params as { conversationId: string };

    const result = await conversationService.updateGroupMeta(
      user.id,
      conversationId,
      req.body as GroupUpdateInput
    );

    res.status(200).json(new ApiResponse(result, 'Group updated successfully'));
  }
);

export const uploadGroupAvatar = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { conversationId } = req.params as { conversationId: string };

    const file = req.file;
    if (!file) throw new ApiError(400, 'VALIDATION_ERROR', 'No file uploaded.');

    await verifyFileMagicBytes(file, ALLOWED_AVATAR_MIME_TYPES);

    const result = await conversationService.uploadGroupAvatar(
      user.id,
      conversationId,
      file.buffer,
      file.mimetype
    );

    res
      .status(200)
      .json(new ApiResponse(result, 'Group photo updated successfully'));
  }
);

export const leaveGroup = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const { conversationId } = req.params as { conversationId: string };

  await conversationService.leaveGroup(user.id, conversationId);

  res.status(200).json(new ApiResponse(null, 'Left the group successfully'));
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const { conversationId } = req.params as { conversationId: string };

  await conversationService.markRead(user.id, conversationId);

  res.status(200).json(new ApiResponse(null, 'Conversation marked as read'));
});

export const muteConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { conversationId } = req.params as { conversationId: string };
    const { duration } = req.body as ConversationMuteInput;

    const result = await conversationService.muteConversation(
      user.id,
      conversationId,
      duration
    );

    res.status(200).json(new ApiResponse(result, 'Conversation muted'));
  }
);

export const unmuteConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { conversationId } = req.params as { conversationId: string };

    const result = await conversationService.unmuteConversation(
      user.id,
      conversationId
    );

    res.status(200).json(new ApiResponse(result, 'Conversation unmuted'));
  }
);

export const archiveConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { conversationId } = req.params as { conversationId: string };

    const result = await conversationService.archiveConversation(
      user.id,
      conversationId
    );

    res.status(200).json(new ApiResponse(result, 'Conversation archived'));
  }
);

export const unarchiveConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { conversationId } = req.params as { conversationId: string };

    const result = await conversationService.unarchiveConversation(
      user.id,
      conversationId
    );

    res.status(200).json(new ApiResponse(result, 'Conversation unarchived'));
  }
);

export const pinConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { conversationId } = req.params as { conversationId: string };

    const result = await conversationService.pinConversation(
      user.id,
      conversationId
    );

    res.status(200).json(new ApiResponse(result, 'Conversation pinned'));
  }
);

export const unpinConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { conversationId } = req.params as { conversationId: string };

    const result = await conversationService.unpinConversation(
      user.id,
      conversationId
    );

    res.status(200).json(new ApiResponse(result, 'Conversation unpinned'));
  }
);

export const setDisappearingMessagesTtl = asyncHandler(
  async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { conversationId } = req.params as { conversationId: string };
    const { ttl } = req.body as ConversationDisappearingTtlInput;

    const result = await conversationService.setDisappearingMessagesTtl(
      user.id,
      conversationId,
      ttl
    );

    res
      .status(200)
      .json(new ApiResponse(result, 'Disappearing messages setting updated'));
  }
);
