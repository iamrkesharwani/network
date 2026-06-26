import { z } from 'zod';
import { isValidObjectId } from '../utils/validators.js';
import {
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_VIDEO_SIZE_BYTES,
  MAX_VIDEO_DURATION_SECONDS,
  VIDEO_CATEGORIES,
  VIDEO_VISIBILITY,
} from '../constants/video.constants.js';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../constants/api.constants.js';

export const initiateVideoUploadSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, { message: 'File name is required.' })
    .max(255, { message: 'File name is too long.' }),

  fileSizeBytes: z
    .number()
    .int()
    .positive({ message: 'File size must be a positive number.' })
    .max(MAX_VIDEO_SIZE_BYTES, {
      message: 'File exceeds the maximum allowed video size.',
    }),

  mimeType: z.enum(ALLOWED_VIDEO_MIME_TYPES, {
    message: 'Unsupported video format.',
  }),

  durationSeconds: z
    .number()
    .int()
    .positive()
    .max(MAX_VIDEO_DURATION_SECONDS, {
      message: 'Video exceeds the maximum allowed duration.',
    })
    .optional(),
});

export const confirmVideoUploadSchema = z.object({
  videoId: z.string().refine(isValidObjectId, {
    message: 'Invalid video ID.',
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
    .max(MAX_VIDEO_SIZE_BYTES, {
      message: 'File exceeds the maximum allowed video size.',
    }),
});

const tagsSchema = z
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
  .max(10, { message: 'You can only add up to 10 tags.' })
  .optional()
  .default([]);

export const videoUploadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title is required.' })
    .min(5, { message: 'Title must be at least 5 characters long.' })
    .max(100, { message: 'Title cannot exceed 100 characters.' }),

  description: z
    .string()
    .trim()
    .max(5000, { message: 'Description cannot exceed 5000 characters.' })
    .optional(),

  thumbnailUrl: z
    .url({ message: 'Thumbnail must be a valid URL.' })
    .startsWith('https://', { message: 'Thumbnail URL must use HTTPS.' })
    .optional(),

  category: z.enum(VIDEO_CATEGORIES, {
    message: 'Invalid or missing category selected.',
  }),

  tags: tagsSchema,

  visibility: z
    .enum(VIDEO_VISIBILITY, {
      message: 'Invalid visibility state selected.',
    })
    .default('public'),
});

export const videoUpdateSchema = videoUploadSchema.partial();

export const videoFeedQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
});

export const videoIdParamSchema = z.object({
  videoId: z.string().refine(isValidObjectId, {
    message: 'Invalid video ID.',
  }),
});
