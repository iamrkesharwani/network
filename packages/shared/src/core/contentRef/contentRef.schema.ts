import { z } from 'zod';
import { isValidObjectId } from '../../utils/validators.js';
import {
  CONTENT_TYPES,
  ENGAGEABLE_CONTENT_TYPES,
} from './contentRef.constants.js';

export const mongoIdSchema = z.string().refine(isValidObjectId, {
  message: 'Invalid ID.',
});

export const contentTypeSchema = z.enum(CONTENT_TYPES);
export const engageableContentTypeSchema = z.enum(ENGAGEABLE_CONTENT_TYPES);

export const contentRefSchema = z.object({
  contentType: engageableContentTypeSchema,
  contentId: mongoIdSchema,
});
