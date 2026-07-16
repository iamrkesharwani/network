import type { z } from 'zod';
import type { deactivateAccountSchema } from '../schemas/account.schema.js';

export type DeactivateAccountInput = z.infer<typeof deactivateAccountSchema>;
