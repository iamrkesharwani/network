import { z } from 'zod';
import { KMS_PROVIDERS } from '@network/shared';

export const kmsEnvSchema = z.object({
  KMS_PROVIDER: z.enum(KMS_PROVIDERS),

  AWS_REGION: z.string().optional(),

  AWS_ACCESS_KEY_ID: z.string().optional(),

  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  MESSAGE_KMS_KEY_ID: z.string().optional(),
});
