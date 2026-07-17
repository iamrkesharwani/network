import type { z } from 'zod';
import type {
  deactivateAccountSchema,
  deleteAccountSchema,
} from './account.schema.js';

export type DeactivateAccountInput = z.infer<typeof deactivateAccountSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
