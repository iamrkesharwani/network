import { z } from 'zod';
import { isValidObjectId } from '../../utils/validators.js';
import { CONTENT_VISIBILITY } from '../general/constants/general.constants.js';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../../core/api/api.constants.js';
import {
  PLAYLIST_CONTENT_TYPES,
  PLAYLIST_TITLE_MAX_LENGTH,
  PLAYLIST_DESCRIPTION_MAX_LENGTH,
} from './playlist.constants.js';

export const playlistContentTypeSchema = z.enum(PLAYLIST_CONTENT_TYPES);

export const playlistCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title is required.' })
    .max(PLAYLIST_TITLE_MAX_LENGTH, {
      message: `Title cannot exceed ${PLAYLIST_TITLE_MAX_LENGTH} characters.`,
    }),

  description: z
    .string()
    .trim()
    .max(PLAYLIST_DESCRIPTION_MAX_LENGTH, {
      message: `Description cannot exceed ${PLAYLIST_DESCRIPTION_MAX_LENGTH} characters.`,
    })
    .optional(),

  visibility: z
    .enum(CONTENT_VISIBILITY, {
      message: 'Invalid visibility state selected.',
    })
    .default('public'),
});

export const playlistUpdateSchema = playlistCreateSchema.partial();

export const playlistIdParamSchema = z.object({
  playlistId: z.string().refine(isValidObjectId, {
    message: 'Invalid playlist ID.',
  }),
});

export const playlistItemAddSchema = z.object({
  contentType: playlistContentTypeSchema,
  contentId: z.string().refine(isValidObjectId, {
    message: 'Invalid content ID.',
  }),
});

export const playlistItemIdParamSchema = z.object({
  playlistId: z.string().refine(isValidObjectId, {
    message: 'Invalid playlist ID.',
  }),
  itemId: z.string().refine(isValidObjectId, {
    message: 'Invalid playlist item ID.',
  }),
});

export const playlistReorderSchema = z.object({
  itemId: z.string().refine(isValidObjectId, {
    message: 'Invalid playlist item ID.',
  }),
  toIndex: z.number().int().min(0),
});

export const playlistFeedQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
});

export const playlistItemsQuerySchema = playlistFeedQuerySchema;

export const playlistContainingQuerySchema = z.object({
  contentType: playlistContentTypeSchema,
  contentId: z.string().refine(isValidObjectId, {
    message: 'Invalid content ID.',
  }),
});
