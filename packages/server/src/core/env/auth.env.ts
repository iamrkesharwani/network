import { z } from 'zod';
import { SEVEN_DAYS_MS } from '@network/shared';

export const authEnvSchema = z.object({
  REFRESH_TOKEN_COOKIE_MS: z.coerce.number().default(SEVEN_DAYS_MS),

  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters' }),

  GOOGLE_CLIENT_ID: z.string(),

  GOOGLE_CLIENT_SECRET: z.string(),

  GOOGLE_REDIRECT_URI: z.url(),
});
