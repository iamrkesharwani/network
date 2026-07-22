import { z } from 'zod';

export const webPushEnvSchema = z.object({
  VAPID_PUBLIC_KEY: z.string().optional(),

  VAPID_PRIVATE_KEY: z.string().optional(),

  VAPID_SUBJECT: z.string().optional(),
});
