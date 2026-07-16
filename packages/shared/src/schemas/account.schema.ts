import { z } from 'zod';
import {
  DEACTIVATION_MIN_DAYS,
  DEACTIVATION_MAX_DAYS,
} from '../constants/account.constants.js';

export const deactivateAccountSchema = z.object({
  days: z.coerce
    .number()
    .int()
    .min(DEACTIVATION_MIN_DAYS, `Must be at least ${DEACTIVATION_MIN_DAYS} day.`)
    .max(DEACTIVATION_MAX_DAYS, `Cannot exceed ${DEACTIVATION_MAX_DAYS} days.`),
});
