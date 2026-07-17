import { z } from 'zod';
import 'dotenv/config';
import { logger } from '../utils/logger.js';
import { appEnvSchema } from './app.env.js';
import { dbEnvSchema } from './db.env.js';
import { redisEnvSchema } from './redis.env.js';
import { authEnvSchema } from './auth.env.js';
import { emailEnvSchema } from './email.env.js';
import { storageEnvSchema } from './storage.env.js';
import { videoEnvSchema } from './video.env.js';
import { typesenseEnvSchema } from './typesense.env.js';
import { withCrossFieldRules } from './validators.js';

const mergedEnvSchema = z.object({
  ...appEnvSchema.shape,
  ...dbEnvSchema.shape,
  ...redisEnvSchema.shape,
  ...authEnvSchema.shape,
  ...emailEnvSchema.shape,
  ...storageEnvSchema.shape,
  ...videoEnvSchema.shape,
  ...typesenseEnvSchema.shape,
});

const envSchema = withCrossFieldRules(mergedEnvSchema);

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  logger.error('FATAL: Environment Variable Validation Failed');
  logger.error(JSON.stringify(z.treeifyError(parsedEnv.error), null, 2));
  process.exit(1);
}

export const env = {
  ...parsedEnv.data,
  SECURE_COOKIES:
    parsedEnv.data.SECURE_COOKIES ?? parsedEnv.data.NODE_ENV === 'production',
};
