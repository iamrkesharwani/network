import type { Request, Response } from 'express';
import type {
  CommentIdParam,
  CommentListQuery,
  CreateCommentInput,
  UpdateCommentInput,
} from '@network/shared';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { ApiPaginatedResponse } from '../../core/utils/ApiPaginatedResponse.js';
import { ApiError } from '../../core/utils/ApiError.js';
import {
  createComment,
  listComments,
  updateComment,
  deleteComment,
} from './comment.service.js';

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { contentType, contentId, text, parentCommentId } =
    req.body as CreateCommentInput;

  const comment = await createComment(
    req.user.id,
    contentType,
    contentId,
    text,
    parentCommentId
  );

  res.status(201).json(new ApiResponse(comment, 'Comment posted successfully'));
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { contentType, contentId, parentCommentId, cursor, limit } =
    req.query as unknown as CommentListQuery;

  const result = await listComments(
    contentType,
    contentId,
    parentCommentId ?? null,
    cursor ?? null,
    limit
  );

  res
    .status(200)
    .json(
      new ApiPaginatedResponse(
        result.data,
        result.meta,
        'Comments fetched successfully'
      )
    );
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { commentId } = req.params as unknown as CommentIdParam;
  const { text } = req.body as UpdateCommentInput;

  const comment = await updateComment(req.user.id, commentId, text);

  res.status(200).json(new ApiResponse(comment, 'Comment updated successfully'));
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const { commentId } = req.params as unknown as CommentIdParam;
  const comment = await deleteComment(req.user.id, commentId);

  res
    .status(200)
    .json(new ApiResponse(comment, 'Comment deleted successfully'));
});
