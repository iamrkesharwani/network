import { env } from '../env/env.js';
import { logger } from '../utils/logger.js';

import { R2StorageProvider } from './storage/r2.provider.js';
import { S3StorageProvider } from './storage/s3.provider.js';
import { AzureBlobStorageProvider } from './storage/azureBlob.provider.js';
import { CloudflareStreamVideoProvider } from './video/cloudflareStream.provider.js';
import { MuxVideoProvider } from './video/muxStream.provider.js';
import { BunnyStreamVideoProvider } from './video/bunnyStream.provider.js';
import { CloudflareImagesProvider } from './image/cloudflareImage.provider.js';
import { S3ImageProvider } from './image/s3Image.provider.js';

import type { IStorageProvider } from './types.js';
import type { IVideoProvider } from './types.js';
import type { IImageProvider } from './types.js';

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

    case 's3':
      return new S3StorageProvider({
        region: env.S3_REGION!,
        accessKeyId: env.S3_ACCESS_KEY_ID!,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
        bucketName: env.S3_BUCKET_NAME!,
        ...(env.S3_ENDPOINT && { endpoint: env.S3_ENDPOINT }),
        ...(env.S3_FORCE_PATH_STYLE && {
          forcePathStyle: env.S3_FORCE_PATH_STYLE === 'true',
        }),
      });

    case 'backblaze':
      return new S3StorageProvider({
        region: env.S3_REGION!,
        accessKeyId: env.S3_ACCESS_KEY_ID!,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
        bucketName: env.S3_BUCKET_NAME!,
        endpoint: `https://s3.${env.S3_REGION}.backblazeb2.com`,
        forcePathStyle: false,
      });

    case 'digitalocean':
      return new S3StorageProvider({
        region: env.S3_REGION!, // e.g. "nyc3"
        accessKeyId: env.S3_ACCESS_KEY_ID!,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
        bucketName: env.S3_BUCKET_NAME!,
        endpoint: `https://${env.S3_REGION}.digitaloceanspaces.com`,
        forcePathStyle: false,
      });

    case 'bunny-storage':
      return new S3StorageProvider({
        region: 'auto',
        accessKeyId: env.S3_ACCESS_KEY_ID!,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
        bucketName: env.S3_BUCKET_NAME!,
        endpoint: env.S3_ENDPOINT!,
        forcePathStyle: true,
      });

    case 'azure':
      return new AzureBlobStorageProvider({
        accountName: env.AZURE_STORAGE_ACCOUNT_NAME!,
        accountKey: env.AZURE_STORAGE_ACCOUNT_KEY!,
        containerName: env.AZURE_STORAGE_CONTAINER_NAME!,
      });

    default:
      throw new Error(
        `Unknown STORAGE_PROVIDER "${name}". ` +
          `Valid values: r2, s3, backblaze, digitalocean, bunny-storage, azure`
      );
  }
}

function buildVideoProvider(): IVideoProvider {
  const name = env.VIDEO_PROVIDER;
  logger.info(`Video provider: ${name}`);

  switch (name) {
    case 'cloudflare':
      return new CloudflareStreamVideoProvider({
        accountId: env.CF_ACCOUNT_ID!,
        apiToken: env.CF_API_TOKEN!,
        webhookSecret: env.CF_STREAM_WEBHOOK_SECRET!,
        customerCode: env.CF_STREAM_CUSTOMER_CODE!,
      });

    case 'mux':
      return new MuxVideoProvider({
        tokenId: env.MUX_TOKEN_ID!,
        tokenSecret: env.MUX_TOKEN_SECRET!,
        webhookSecret: env.MUX_WEBHOOK_SECRET!,
      });

    case 'bunny-stream':
      return new BunnyStreamVideoProvider({
        libraryId: env.BUNNY_STREAM_LIBRARY_ID!,
        apiKey: env.BUNNY_STREAM_API_KEY!,
        cdnHostname: env.BUNNY_STREAM_CDN_HOSTNAME!,
        webhookSecret: env.BUNNY_STREAM_WEBHOOK_SECRET!,
      });

    default:
      throw new Error(
        `Unknown VIDEO_PROVIDER "${name}". ` +
          `Valid values: cloudflare, mux, bunny-stream`
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

export const storageProvider: IStorageProvider = buildStorageProvider();
export const videoProvider: IVideoProvider = buildVideoProvider();
export const imageProvider: IImageProvider = buildImageProvider();
