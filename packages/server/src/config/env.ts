import { z } from 'zod';
import 'dotenv/config';
import { logger } from '../utils/logger.js';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.url(),
  MONGODB_URI: z.url(),
  DB_NAME: z.string().default('network'),
  REDIS_URI: z.url(),
  JWT_SECRET: z
    .string()
    .min(32, { message: 'JWT_SECRET must be at least 32 characters' }),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, { message: 'JWT_REFRESH_SECRET must be at least 32 characters' }),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.url(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  EMAIL_FROM: z.email(),
  CF_ACCOUNT_ID: z.string(),
  CF_API_TOKEN: z.string(),
  CF_R2_ACCESS_KEY_ID: z.string(),
  CF_R2_SECRET_ACCESS_KEY: z.string(),
  CF_R2_BUCKET_NAME: z.string(),
  CF_PUBLIC_URL: z.url(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  logger.error('FATAL: Environment Variable Validation Failed');
  logger.error(JSON.stringify(z.treeifyError(parsedEnv.error), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
