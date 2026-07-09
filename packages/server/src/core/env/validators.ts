import { z } from 'zod';
import { STORAGE_PROVIDERS } from '@network/shared';

type StorageProvider = (typeof STORAGE_PROVIDERS)[number];

const need = <T extends Record<string, unknown>>(
  data: T,
  key: keyof T
): boolean => Boolean(data[key]);

export const withCrossFieldRules = <T extends z.ZodObject<z.ZodRawShape>>(
  schema: T
) =>
  schema
    .refine(
      (d) => {
        const usesCF =
          d['STORAGE_PROVIDER'] === 'r2' ||
          d['VIDEO_PROVIDER'] === 'cloudflare' ||
          d['IMAGE_PROVIDER'] === 'cloudflare';
        return !usesCF || (need(d, 'CF_ACCOUNT_ID') && need(d, 'CF_API_TOKEN'));
      },
      {
        message:
          'CF_ACCOUNT_ID and CF_API_TOKEN are required when any Cloudflare provider is active.',
      }
    )
    .refine(
      (d) =>
        d['STORAGE_PROVIDER'] !== 'r2' ||
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
        d['VIDEO_PROVIDER'] !== 'cloudflare' ||
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
        ].includes(d['STORAGE_PROVIDER'] as StorageProvider);
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
        d['STORAGE_PROVIDER'] !== 'azure' ||
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
        d['VIDEO_PROVIDER'] !== 'mux' ||
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
        d['VIDEO_PROVIDER'] !== 'bunny-stream' ||
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
        d['IMAGE_PROVIDER'] !== 's3-cdn' ||
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
