import { z } from 'zod';
import { VIDEO_PROVIDERS } from '@network/shared';

export const videoEnvSchema = z.object({
  VIDEO_PROVIDER: z.enum(VIDEO_PROVIDERS),
});
