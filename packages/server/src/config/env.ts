import { z } from 'zod';
import 'dotenv/config';
import { logger } from '../utils/logger.js';

const STORAGE_PROVIDERS = [
  'r2',
  's3',
  'backblaze',
  'digitalocean',
  'bunny-storage',
  'azure',
] as const;
const VIDEO_PROVIDERS = ['cloudflare', 'mux', 'bunny-stream'] as const;
const IMAGE_PROVIDERS = ['cloudflare', 's3-cdn'] as const;

type StorageProvider = (typeof STORAGE_PROVIDERS)[number];

const SEVEN_DAYS_MS = 604800000;

const baseSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().default(5000),

  BASE_URL: z.string().default('/'),

  CLIENT_URL: z.url(),

  MONGODB_URI: z.url(),

  DB_NAME: z.string().default('network'),

  REDIS_URI: z.url(),

  TRUST_PROXY_HOPS: z.string().default('1'),

  REFRESH_TOKEN_COOKIE_MS: z.coerce.number().default(SEVEN_DAYS_MS),

  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters' }),

  GOOGLE_CLIENT_ID: z.string(),

  GOOGLE_CLIENT_SECRET: z.string(),

  GOOGLE_REDIRECT_URI: z.url(),

  GITHUB_CLIENT_ID: z.string(),

  GITHUB_CLIENT_SECRET: z.string(),

  GITHUB_REDIRECT_URI: z.url(),

  EMAIL_FROM: z.email(),

  SMTP_HOST: z.string(),

  SMTP_PORT: z.coerce.number(),

  SMTP_USER: z.string(),

  SMTP_PASS: z.string(),

  STORAGE_PROVIDER: z.enum(STORAGE_PROVIDERS),

  VIDEO_PROVIDER: z.enum(VIDEO_PROVIDERS),

  IMAGE_PROVIDER: z.enum(IMAGE_PROVIDERS),

  CF_ACCOUNT_ID: z.string().optional(),

  CF_API_TOKEN: z.string().optional(),

  CF_PUBLIC_URL: z.url().optional(),

  CF_R2_ACCESS_KEY_ID: z.string().optional(),

  CF_R2_SECRET_ACCESS_KEY: z.string().optional(),

  CF_R2_BUCKET_NAME: z.string().optional(),

  CF_STREAM_WEBHOOK_SECRET: z.string().optional(),

  CF_STREAM_CUSTOMER_CODE: z.string().optional(),

  S3_REGION: z.string().optional(),

  S3_ACCESS_KEY_ID: z.string().optional(),

  S3_SECRET_ACCESS_KEY: z.string().optional(),

  S3_BUCKET_NAME: z.string().optional(),

  S3_ENDPOINT: z.string().optional(),

  S3_FORCE_PATH_STYLE: z.string().optional(),

  IMAGE_CDN_BASE_URL: z.string().optional(),

  AZURE_STORAGE_ACCOUNT_NAME: z.string().optional(),

  AZURE_STORAGE_ACCOUNT_KEY: z.string().optional(),

  AZURE_STORAGE_CONTAINER_NAME: z.string().optional(),

  MUX_TOKEN_ID: z.string().optional(),

  MUX_TOKEN_SECRET: z.string().optional(),

  MUX_WEBHOOK_SECRET: z.string().optional(),

  BUNNY_STREAM_LIBRARY_ID: z.string().optional(),

  BUNNY_STREAM_API_KEY: z.string().optional(),

  BUNNY_STREAM_CDN_HOSTNAME: z.string().optional(),

  BUNNY_STREAM_WEBHOOK_SECRET: z.string().optional(),

  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info'),
});

type BaseEnv = z.infer<typeof baseSchema>;

const need = (data: BaseEnv, key: keyof BaseEnv): boolean => Boolean(data[key]);

const envSchema = baseSchema
  .refine(
    (d) => {
      const usesCF =
        d.STORAGE_PROVIDER === 'r2' ||
        d.VIDEO_PROVIDER === 'cloudflare' ||
        d.IMAGE_PROVIDER === 'cloudflare';
      return !usesCF || (need(d, 'CF_ACCOUNT_ID') && need(d, 'CF_API_TOKEN'));
    },
    {
      message:
        'CF_ACCOUNT_ID and CF_API_TOKEN are required when any Cloudflare provider is active.',
    }
  )
  .refine(
    (d) =>
      d.STORAGE_PROVIDER !== 'r2' ||
      (need(d, 'CF_R2_ACCESS_KEY_ID') &&
        need(d, 'CF_R2_SECRET_ACCESS_KEY') &&
        need(d, 'CF_R2_BUCKET_NAME')),
    {
      message:
        'STORAGE_PROVIDER=r2 requires CF_R2_ACCESS_KEY_ID, CF_R2_SECRET_ACCESS_KEY, CF_R2_BUCKET_NAME.',
    }
  )
  .refine(
    (d) =>
      d.VIDEO_PROVIDER !== 'cloudflare' ||
      (need(d, 'CF_STREAM_WEBHOOK_SECRET') &&
        need(d, 'CF_STREAM_CUSTOMER_CODE')),
    {
      message:
        'VIDEO_PROVIDER=cloudflare requires CF_STREAM_WEBHOOK_SECRET and CF_STREAM_CUSTOMER_CODE.',
    }
  )
  .refine(
    (d) => {
      const needsS3 = [
        's3',
        'backblaze',
        'digitalocean',
        'bunny-storage',
      ].includes(d.STORAGE_PROVIDER as StorageProvider);
      return (
        !needsS3 ||
        (need(d, 'S3_REGION') &&
          need(d, 'S3_ACCESS_KEY_ID') &&
          need(d, 'S3_SECRET_ACCESS_KEY') &&
          need(d, 'S3_BUCKET_NAME'))
      );
    },
    {
      message:
        'STORAGE_PROVIDER=s3|backblaze|digitalocean|bunny-storage requires S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME.',
    }
  )
  .refine(
    (d) =>
      d.STORAGE_PROVIDER !== 'azure' ||
      (need(d, 'AZURE_STORAGE_ACCOUNT_NAME') &&
        need(d, 'AZURE_STORAGE_ACCOUNT_KEY') &&
        need(d, 'AZURE_STORAGE_CONTAINER_NAME')),
    {
      message:
        'STORAGE_PROVIDER=azure requires AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY, AZURE_STORAGE_CONTAINER_NAME.',
    }
  )
  .refine(
    (d) =>
      d.VIDEO_PROVIDER !== 'mux' ||
      (need(d, 'MUX_TOKEN_ID') &&
        need(d, 'MUX_TOKEN_SECRET') &&
        need(d, 'MUX_WEBHOOK_SECRET')),
    {
      message:
        'VIDEO_PROVIDER=mux requires MUX_TOKEN_ID, MUX_TOKEN_SECRET, MUX_WEBHOOK_SECRET.',
    }
  )
  .refine(
    (d) =>
      d.VIDEO_PROVIDER !== 'bunny-stream' ||
      (need(d, 'BUNNY_STREAM_LIBRARY_ID') &&
        need(d, 'BUNNY_STREAM_API_KEY') &&
        need(d, 'BUNNY_STREAM_CDN_HOSTNAME') &&
        need(d, 'BUNNY_STREAM_WEBHOOK_SECRET')),
    {
      message:
        'VIDEO_PROVIDER=bunny-stream requires BUNNY_STREAM_LIBRARY_ID, BUNNY_STREAM_API_KEY, BUNNY_STREAM_CDN_HOSTNAME, BUNNY_STREAM_WEBHOOK_SECRET.',
    }
  )
  .refine(
    (d) =>
      d.IMAGE_PROVIDER !== 's3-cdn' ||
      (need(d, 'S3_REGION') &&
        need(d, 'S3_ACCESS_KEY_ID') &&
        need(d, 'S3_SECRET_ACCESS_KEY') &&
        need(d, 'S3_BUCKET_NAME') &&
        need(d, 'IMAGE_CDN_BASE_URL')),
    {
      message:
        'IMAGE_PROVIDER=s3-cdn requires S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME, IMAGE_CDN_BASE_URL.',
    }
  );

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  logger.error('FATAL: Environment Variable Validation Failed');
  logger.error(JSON.stringify(z.treeifyError(parsedEnv.error), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
