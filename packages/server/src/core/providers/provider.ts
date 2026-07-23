import { env } from '../env/env.js';
import { logger } from '../utils/logger.js';

import { R2StorageProvider } from './storage/r2.provider.js';
import { LocalFfmpegVideoProvider } from './video/localFfmpeg.provider.js';
import { CloudflareImagesProvider } from './image/cloudflareImage.provider.js';
import { S3ImageProvider } from './image/s3Image.provider.js';
import { AwsKmsProvider } from './kms/awsKms.provider.js';

import type { IStorageProvider } from './types.js';
import type { IPublicUrlStorageProvider } from './types.js';
import type { IVideoProvider } from './types.js';
import type { IImageProvider } from './types.js';
import type { IKmsProvider } from './types.js';

function buildStorageProvider(): IStorageProvider {
  const name = env.STORAGE_PROVIDER;
  logger.info(`Storage provider: ${name}`);

  switch (name) {
    case 'r2':
      return new R2StorageProvider({
        accountId: env.CF_ACCOUNT_ID!,
        accessKeyId: env.CF_R2_ACCESS_KEY_ID!,
        secretAccessKey: env.CF_R2_SECRET_ACCESS_KEY!,
        bucketName: env.CF_R2_BUCKET_NAME!,
      });

    default:
      throw new Error(
        `Unknown STORAGE_PROVIDER "${name}". Valid values: r2`
      );
  }
}

function buildProcessedStorageProvider(): IPublicUrlStorageProvider {
  return new R2StorageProvider({
    accountId: env.CF_ACCOUNT_ID!,
    accessKeyId: env.CF_R2_ACCESS_KEY_ID!,
    secretAccessKey: env.CF_R2_SECRET_ACCESS_KEY!,
    bucketName: env.CF_R2_PROCESSED_BUCKET_NAME!,
    publicBaseUrl: env.CF_PUBLIC_URL!,
  });
}

function buildVideoProvider(
  processedStorage: IPublicUrlStorageProvider
): IVideoProvider {
  const name = env.VIDEO_PROVIDER;
  logger.info(`Video provider: ${name}`);

  switch (name) {
    case 'local-ffmpeg':
      return new LocalFfmpegVideoProvider({
        processedStorage,
      });

    default:
      throw new Error(
        `Unknown VIDEO_PROVIDER "${name}". Valid values: local-ffmpeg`
      );
  }
}

function buildImageProvider(): IImageProvider {
  const name = env.IMAGE_PROVIDER;
  logger.info(`Image provider: ${name}`);

  switch (name) {
    case 'cloudflare':
      return new CloudflareImagesProvider({
        accountId: env.CF_ACCOUNT_ID!,
        apiToken: env.CF_API_TOKEN!,
      });

    case 's3-cdn':
      return new S3ImageProvider({
        region: env.S3_REGION!,
        accessKeyId: env.S3_ACCESS_KEY_ID!,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
        bucketName: env.S3_BUCKET_NAME!,
        cdnBaseUrl: env.IMAGE_CDN_BASE_URL!,
        ...(env.S3_ENDPOINT && { endpoint: env.S3_ENDPOINT }),
        ...(env.S3_FORCE_PATH_STYLE && {
          forcePathStyle: env.S3_FORCE_PATH_STYLE === 'true',
        }),
      });

    default:
      throw new Error(
        `Unknown IMAGE_PROVIDER "${name}". ` +
          `Valid values: cloudflare, s3-cdn`
      );
  }
}

function buildKmsProvider(): IKmsProvider {
  const name = env.KMS_PROVIDER;
  logger.info(`KMS provider: ${name}`);

  switch (name) {
    case 'aws':
      return new AwsKmsProvider({
        region: env.AWS_REGION!,
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
        keyId: env.MESSAGE_KMS_KEY_ID!,
      });

    default:
      throw new Error(`Unknown KMS_PROVIDER "${name}". Valid values: aws`);
  }
}

export const storageProvider: IStorageProvider = buildStorageProvider();
export const processedStorageProvider: IPublicUrlStorageProvider =
  buildProcessedStorageProvider();
export const videoProvider: IVideoProvider = buildVideoProvider(
  processedStorageProvider
);
export const imageProvider: IImageProvider = buildImageProvider();
export const kmsProvider: IKmsProvider = buildKmsProvider();
