import { z } from 'zod';
import { VIDEO_PROVIDERS } from '@network/shared';

export const videoEnvSchema = z.object({
  VIDEO_PROVIDER: z.enum(VIDEO_PROVIDERS),

  CF_STREAM_WEBHOOK_SECRET: z.string().optional(),

  CF_STREAM_CUSTOMER_CODE: z.string().optional(),

  MUX_TOKEN_ID: z.string().optional(),

  MUX_TOKEN_SECRET: z.string().optional(),

  MUX_WEBHOOK_SECRET: z.string().optional(),

  BUNNY_STREAM_LIBRARY_ID: z.string().optional(),

  BUNNY_STREAM_API_KEY: z.string().optional(),

  BUNNY_STREAM_CDN_HOSTNAME: z.string().optional(),

  BUNNY_STREAM_WEBHOOK_SECRET: z.string().optional(),
});
