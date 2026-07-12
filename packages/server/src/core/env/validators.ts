import { z } from 'zod';

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
        d['VIDEO_PROVIDER'] !== 'local-ffmpeg' ||
        (need(d, 'CF_PUBLIC_URL') && need(d, 'CF_R2_PROCESSED_BUCKET_NAME')),
      {
        message:
          'VIDEO_PROVIDER=local-ffmpeg requires CF_PUBLIC_URL (the public base URL the processed-media bucket is served from) and CF_R2_PROCESSED_BUCKET_NAME (a bucket separate from raw uploads, so raw upload keys never need to be publicly exposed).',
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
