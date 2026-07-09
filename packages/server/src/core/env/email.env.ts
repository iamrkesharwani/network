import { z } from 'zod';

export const emailEnvSchema = z.object({
  EMAIL_FROM: z.email(),

  SMTP_HOST: z.string(),

  SMTP_PORT: z.coerce.number(),

  SMTP_USER: z.string(),

  SMTP_PASS: z.string(),
});
