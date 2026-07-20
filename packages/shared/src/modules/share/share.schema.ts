import { z } from 'zod';
import {
  contentTypeSchema,
  mongoIdSchema,
} from '../../core/contentRef/contentRef.schema.js';

export const shareCreateSchema = z.object({
  contentType: contentTypeSchema,
  contentId: mongoIdSchema,
});
