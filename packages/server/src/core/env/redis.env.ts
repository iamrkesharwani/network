import { z } from 'zod';

export const redisEnvSchema = z.object({
  REDIS_URI: z.url(),
});
