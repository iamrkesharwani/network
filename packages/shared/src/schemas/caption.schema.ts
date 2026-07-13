import { z } from 'zod';
import { isValidObjectId } from '../utils/validators.js';
import { CAPTION_LANGUAGE_CODES } from '../constants/caption.constants.js';

export const captionUploadSchema = z.object({
  language: z.enum(CAPTION_LANGUAGE_CODES, {
    message: 'Invalid or unsupported caption language.',
  }),

  isDefault: z.stringbool().optional().default(false),
});

export const captionIdParamSchema = z.object({
  videoId: z.string().refine(isValidObjectId, {
    message: 'Invalid video ID.',
  }),

  captionId: z.string().refine(isValidObjectId, {
    message: 'Invalid caption ID.',
  }),
});
