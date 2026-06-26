import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  RAW_UPLOAD_KEY_PREFIX,
  RAW_UPLOAD_PRESIGNED_URL_TTL_SECONDS,
} from '@network/shared';
import { logger } from '../../utils/logger.js';
import type { IStorageProvider, PresignUploadResult } from '../types.js';

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export class R2StorageProvider implements IStorageProvider {
  private readonly client: S3Client;
  private readonly bucketName: string;

  constructor(config: R2Config) {
    this.bucketName = config.bucketName;
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  private buildKey(userId: string, videoId: string): string {
    return `${RAW_UPLOAD_KEY_PREFIX}/${userId}/${videoId}`;
  }

  isOwnedKey(key: string, userId: string, videoId: string): boolean {
    return key === this.buildKey(userId, videoId);
  }

  async presignUpload(
    userId: string,
    videoId: string,
    contentType: string,
    contentLength: number
  ): Promise<PresignUploadResult> {
    const key = this.buildKey(userId, videoId);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: RAW_UPLOAD_PRESIGNED_URL_TTL_SECONDS,
    });

    return { url, key };
  }

  async buildAccessUrl(key: string): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
      { expiresIn: 60 * 60 * 6 }
    );
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: key })
      );
    } catch (error) {
      logger.warn(error, `R2: failed to delete object ${key}`);
    }
  }
}
