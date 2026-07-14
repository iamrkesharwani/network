import { z } from 'zod';

export const redisEnvSchema = z.object({
  REDIS_URI_CORE: z.url(),
  REDIS_URI_SOCKET: z.url(),
  REDIS_URI_QUEUE: z.url(),
});
