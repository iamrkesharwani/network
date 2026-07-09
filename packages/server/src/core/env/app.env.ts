import { z } from 'zod';

export const appEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),

  PORT: z.coerce.number().default(5000),

  BASE_URL: z.string().default('/'),

  CLIENT_URL: z.url(),

  TRUST_PROXY_HOPS: z.string().default('1'),
  
  DISABLE_RATE_LIMIT: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),

  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
});
