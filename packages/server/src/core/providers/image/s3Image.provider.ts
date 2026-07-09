import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { IImageProvider } from '../types.js';
import { randomUUID } from 'node:crypto';
import { THUMBNAIL_KEY_PREFIX } from '@network/shared';
import { logger } from '../../utils/logger.js';

export interface S3ImageConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  cdnBaseUrl: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

export class S3ImageProvider implements IImageProvider {
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly cdnBaseUrl: string;

  private extractKey(urlOrKey: string): string | null {
    if (!urlOrKey.startsWith('http')) return urlOrKey;
    const base = this.cdnBaseUrl;
    const start = urlOrKey.indexOf(base);
    if (start === -1) return null;
    return urlOrKey.slice(start + base.length).replace(/^\//, '');
  }

  constructor(config: S3ImageConfig) {
    this.bucketName = config.bucketName;
    this.cdnBaseUrl = config.cdnBaseUrl;
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...(config.endpoint && { endpoint: config.endpoint }),
      forcePathStyle: config.forcePathStyle ?? false,
    });
  }

  async uploadImage(buffer: Buffer, mimeType: string): Promise<string> {
    const ext = mimeType.split('/')[1] ?? 'jpg';
    const key = `${THUMBNAIL_KEY_PREFIX}/${randomUUID()}.${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
      })
    );

    return `${this.cdnBaseUrl}/${key}`;
  }

  async deleteImage(urlOrKey: string): Promise<void> {
    const key = this.extractKey(urlOrKey);
    if (!key) {
      logger.warn({ urlOrKey }, 'S3 Image: could not extract key for deletion');
      return;
    }

    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: key })
      );
    } catch (error) {
      logger.warn(error, `S3 Image: failed to delete ${key}`);
    }
  }
}
