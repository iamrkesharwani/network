import { z } from 'zod';
import { isValidObjectId } from '../utils/validators.js';
import {
  ALLOWED_POST_VIDEO_MIME_TYPES,
  MAX_POST_VIDEO_SIZE_BYTES,
  MAX_POST_VIDEO_DURATION_SECONDS,
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

export const initiatePostVideoUploadSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, { message: 'File name is required.' })
    .max(255, { message: 'File name is too long.' }),

  fileSizeBytes: z
    .number()
    .int()
    .positive({ message: 'File size must be a positive number.' })
    .max(MAX_POST_VIDEO_SIZE_BYTES, {
      message: 'File exceeds the maximum allowed post video size.',
    }),

  mimeType: z.enum(ALLOWED_POST_VIDEO_MIME_TYPES, {
    message: 'Unsupported video format.',
  }),

  durationSeconds: z
    .number()
    .int()
    .positive()
    .max(MAX_POST_VIDEO_DURATION_SECONDS, {
      message: 'Post video exceeds the maximum allowed duration.',
    })
    .optional(),
});

export const confirmPostVideoUploadSchema = z.object({
  postId: z.string().refine(isValidObjectId, {
    message: 'Invalid post ID.',
  }),

  storageKey: z
    .string()
    .trim()
    .min(1)
    .max(512, { message: 'storageKey is too long.' }),

  fileSizeBytes: z
    .number()
    .int()
    .positive({ message: 'File size must be a positive number.' })
    .max(MAX_POST_VIDEO_SIZE_BYTES, {
      message: 'File exceeds the maximum allowed post video size.',
    }),
});

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
  page: z.coerce.number().int().positive().default(1),
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
