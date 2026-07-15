import { z } from 'zod';
import { isValidObjectId } from '../utils/validators.js';
import { JURY_VOTE_CHOICES } from '../constants/jury.constants.js';

export const juryCaseIdParamSchema = z.object({
  caseId: z.string().refine(isValidObjectId, {
    message: 'Invalid case ID.',
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
