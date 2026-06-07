import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.js';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CF_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CF_R2_SECRET_ACCESS_KEY,
  },
});

export const getCloudflareApiHeaders = () => ({
  Authorization: `Bearer ${env.CF_API_TOKEN}`,
  'Content-Type': 'application/json',
});

export const CF_STREAM_API_URL = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/stream`;

export const CF_IMAGES_API_URL = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/images/v1`;
