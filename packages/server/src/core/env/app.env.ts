import { z } from 'zod';
import { PROCESS_ROLES } from '@network/shared';

export const appEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),

  PROCESS_ROLE: z.enum(PROCESS_ROLES).default('web'),

  PORT: z.coerce.number().default(5000),

  BASE_URL: z.string().default('/'),

  CLIENT_URL: z.url(),

  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(10).default(1),

  DISABLE_RATE_LIMIT: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),

  SECURE_COOKIES: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),

  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
});
