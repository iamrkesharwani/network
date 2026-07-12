import { z } from 'zod';
import { IMAGE_PROVIDERS, STORAGE_PROVIDERS } from '@network/shared';

export const storageEnvSchema = z.object({
  STORAGE_PROVIDER: z.enum(STORAGE_PROVIDERS),

  IMAGE_PROVIDER: z.enum(IMAGE_PROVIDERS),

  CF_ACCOUNT_ID: z.string().optional(),

  CF_API_TOKEN: z.string().optional(),

  CF_PUBLIC_URL: z.url().optional(),

  CF_R2_ACCESS_KEY_ID: z.string().optional(),

  CF_R2_SECRET_ACCESS_KEY: z.string().optional(),

  CF_R2_BUCKET_NAME: z.string().optional(),

  CF_R2_PROCESSED_BUCKET_NAME: z.string().optional(),

  S3_REGION: z.string().optional(),

  S3_ACCESS_KEY_ID: z.string().optional(),

  S3_SECRET_ACCESS_KEY: z.string().optional(),

  S3_BUCKET_NAME: z.string().optional(),

  S3_ENDPOINT: z.string().optional(),

  S3_FORCE_PATH_STYLE: z.string().optional(),

  IMAGE_CDN_BASE_URL: z.string().optional(),
});
