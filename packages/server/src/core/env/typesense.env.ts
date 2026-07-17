import { z } from 'zod';

export const typesenseEnvSchema = z.object({
  TYPESENSE_HOST: z.string().min(1, 'TYPESENSE_HOST is required.'),
  TYPESENSE_PORT: z.coerce.number().int().positive(),
  TYPESENSE_PROTOCOL: z.enum(['http', 'https']),
  TYPESENSE_API_KEY: z.string().min(1, 'TYPESENSE_API_KEY is required.'),
});
