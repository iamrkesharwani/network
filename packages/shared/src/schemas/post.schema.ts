import { z } from 'zod';
import { isValidObjectId } from '../utils/validators.js';
import {
  POST_TEXT_MAX_LENGTH,
  POST_VISIBILITY,
} from '../constants/post.constants.js';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../constants/api.constants.js';

const postTagsSchema = z
  .array(
    z
      .string()
      .trim()
      .toLowerCase()
      .min(2, { message: 'Tag must be at least 2 characters.' })
      .max(20, { message: 'Tag cannot exceed 20 characters.' })
      .regex(/^[a-z0-9]+$/, {
        message: 'Tags can only contain letters and numbers.',
      })
  )
  .max(5, { message: 'Posts can have a maximum of 5 tags.' })
  .optional()
  .default([]);

const postTextSchema = z
  .string()
  .trim()
  .max(POST_TEXT_MAX_LENGTH, {
    message: `Post text cannot exceed ${POST_TEXT_MAX_LENGTH} characters.`,
  })
  .optional();

export const createPostSchema = z.object({
  text: postTextSchema,
  tags: postTagsSchema,
  visibility: z
    .enum(POST_VISIBILITY, {
      message: 'Invalid visibility state selected.',
    })
    .default('public'),
});

export const postUpdateSchema = createPostSchema.partial();

export const postFinaliseSchema = z.object({
  text: postTextSchema,
  tags: postTagsSchema,
  visibility: z
    .enum(POST_VISIBILITY, {
      message: 'Invalid visibility state selected.',
    })
    .default('public'),
});

export const postFeedQuerySchema = z.object({
  cursor: z
    .string()
    .refine(isValidObjectId, { message: 'Invalid cursor.' })
    .optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
});

export const postIdParamSchema = z.object({
  postId: z.string().refine(isValidObjectId, {
    message: 'Invalid post ID.',
  }),
});
