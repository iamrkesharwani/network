import { z } from 'zod';
import {
  contentTypeSchema,
  mongoIdSchema,
} from '../../core/contentRef/contentRef.schema.js';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../../core/api/api.constants.js';
import { COMMENT_TEXT_MAX_LENGTH } from './comment.constants.js';

const commentTextSchema = z
  .string()
  .trim()
  .min(1, { message: 'Comment cannot be empty.' })
  .max(COMMENT_TEXT_MAX_LENGTH, {
    message: `Comment cannot exceed ${COMMENT_TEXT_MAX_LENGTH} characters.`,
  });

export const createCommentSchema = z.object({
  contentType: contentTypeSchema,
  contentId: mongoIdSchema,
  parentCommentId: mongoIdSchema.optional(),
  text: commentTextSchema,
});

export const updateCommentSchema = z.object({
  text: commentTextSchema,
});

export const commentListQuerySchema = z.object({
  contentType: contentTypeSchema,
  contentId: mongoIdSchema,
  parentCommentId: mongoIdSchema.optional(),
  cursor: z.string().nullish(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
});

export const commentIdParamSchema = z.object({
  commentId: mongoIdSchema,
});
