import { z } from 'zod';
import { isValidObjectId } from '../../utils/validators.js';
import {
  REPORTABLE_CONTENT_TYPES,
  REPORT_REASON_CODES,
  REPORT_NOTE_MAX_LENGTH,
  REPORT_DISCLOSED_CONTENT_MAX_LENGTH,
} from './report.constants.js';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../../core/api/api.constants.js';

export const reportContentTypeSchema = z.enum(REPORTABLE_CONTENT_TYPES);
export const reportReasonCodeSchema = z.enum(REPORT_REASON_CODES);

export const reportCreateSchema = z
  .object({
    contentType: reportContentTypeSchema,
    contentId: z.string().refine(isValidObjectId, {
      message: 'Invalid content ID.',
    }),
    reasonCode: reportReasonCodeSchema,
    note: z.string().trim().max(REPORT_NOTE_MAX_LENGTH).optional(),
    disclosedContent: z
      .string()
      .trim()
      .max(REPORT_DISCLOSED_CONTENT_MAX_LENGTH)
      .optional(),
  })
  .refine((data) => data.contentType !== 'message' || !!data.disclosedContent, {
    message:
      'Since messages are end-to-end encrypted, please include the message content you saw.',
    path: ['disclosedContent'],
  });

export const reportMineQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
});
