import { z } from 'zod';

export const appEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().default(5000),

  BASE_URL: z.string().default('/'),

  CLIENT_URL: z.url(),

  TRUST_PROXY_HOPS: z.string().default('1'),

  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
});
