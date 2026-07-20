import { z } from 'zod';
import {
  contentRefSchema,
  engageableContentTypeSchema,
} from '../../core/contentRef/contentRef.schema.js';

export const likeToggleSchema = contentRefSchema;

export const likeStatusQuerySchema = z.object({
  contentType: engageableContentTypeSchema,
  contentIds: z.string().min(1),
});
