import { z } from 'zod';

export const dbEnvSchema = z.object({
  MONGODB_URI: z.url(),

  DB_NAME: z.string().default('network'),
});
