import { z } from 'zod';
import { isValidObjectId } from '../utils/validators.js';
import {
  ALLOWED_SHORT_MIME_TYPES,
  MAX_SHORT_SIZE_BYTES,
  MAX_SHORT_DURATION_SECONDS,
  SHORT_VISIBILITY,
  SHORT_TITLE_MAX_LENGTH,
  SHORT_DESCRIPTION_MAX_LENGTH,
} from '../constants/short.constants.js';
import { CONTENT_VISIBILITY } from '../constants/visibility.constants.js';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../constants/api.constants.js';

export const initiateShortUploadSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, { message: 'File name is required.' })
    .max(255, { message: 'File name is too long.' }),

  fileSizeBytes: z
    .number()
    .int()
    .positive({ message: 'File size must be a positive number.' })
    .max(MAX_SHORT_SIZE_BYTES, {
      message: 'File exceeds the maximum allowed short size.',
    }),

  mimeType: z.enum(ALLOWED_SHORT_MIME_TYPES, {
    message: 'Unsupported video format.',
  }),

  durationSeconds: z
    .number()
    .int()
    .positive()
    .max(MAX_SHORT_DURATION_SECONDS, {
      message: 'Short exceeds the maximum allowed duration.',
    })
    .optional(),
});

export const confirmShortUploadSchema = z.object({
  shortId: z.string().refine(isValidObjectId, {
    message: 'Invalid short ID.',
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
    .max(MAX_SHORT_SIZE_BYTES, {
      message: 'File exceeds the maximum allowed short size.',
    }),
});

const shortTagsSchema = z
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
  .max(5, { message: 'Shorts can have a maximum of 5 tags.' })
  .optional()
  .default([]);

export const shortUploadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title is required.' })
    .min(5, { message: 'Title must be at least 5 characters long.' })
    .max(SHORT_TITLE_MAX_LENGTH, {
      message: `Title cannot exceed ${SHORT_TITLE_MAX_LENGTH} characters.`,
    }),

  description: z
    .string()
    .trim()
    .max(SHORT_DESCRIPTION_MAX_LENGTH, {
      message: `Description cannot exceed ${SHORT_DESCRIPTION_MAX_LENGTH} characters.`,
    })
    .optional(),

  thumbnailUrl: z
    .url({ message: 'Thumbnail must be a valid URL.' })
    .startsWith('https://', { message: 'Thumbnail URL must use HTTPS.' })
    .optional(),

  tags: shortTagsSchema,

  visibility: z
    .enum(SHORT_VISIBILITY, {
      message: 'Invalid visibility state selected.',
    })
    .default('public'),
});

export const shortUpdateSchema = shortUploadSchema.partial();

export const shortFeedQuerySchema = z.object({
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

export const shortIdParamSchema = z.object({
  shortId: z.string().refine(isValidObjectId, {
    message: 'Invalid short ID.',
  }),
});

export const shortUserFeedQuerySchema = shortFeedQuerySchema.extend({
  visibility: z.enum(CONTENT_VISIBILITY).optional(),
});
