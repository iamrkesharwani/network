import { z } from 'zod';
import { isValidObjectId } from '../utils/validators.js';
import { JURY_VOTE_CHOICES } from '../constants/jury.constants.js';
import { reportContentTypeSchema } from './report.schema.js';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../constants/api.constants.js';

export const juryCaseIdParamSchema = z.object({
  caseId: z.string().refine(isValidObjectId, {
    message: 'Invalid case ID.',
  }),
});

export const juryContentParamSchema = z.object({
  contentType: reportContentTypeSchema,
  contentId: z.string().refine(isValidObjectId, {
    message: 'Invalid content ID.',
  }),
});

export const juryAppealIdParamSchema = z.object({
  appealId: z.string().refine(isValidObjectId, {
    message: 'Invalid appeal ID.',
  }),
});

export const juryVoteSchema = z.object({
  vote: z.enum(JURY_VOTE_CHOICES),
});

export const juryAppealCreateSchema = z.object({
  caseId: z.string().refine(isValidObjectId, {
    message: 'Invalid case ID.',
  }),
  reason: z.string().trim().min(1).max(1000),
});

export const juryAppealResolveSchema = z.object({
  action: z.enum(['uphold', 'overturn']),
  note: z.string().trim().max(1000).optional(),
});

export const juryMineQuerySchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
});
