import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';
import {
  RAW_UPLOAD_KEY_PREFIX,
  RAW_UPLOAD_PRESIGNED_URL_TTL_SECONDS,
} from '@network/shared';
import { logger } from '../../utils/logger.js';
import type {
  IStorageProvider,
  PresignUploadResult,
  RawUploadMediaType,
} from '../types.js';

export interface S3Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

export class S3StorageProvider implements IStorageProvider {
  private readonly client: S3Client;
  private readonly bucketName: string;

  constructor(config: S3Config) {
    this.bucketName = config.bucketName;
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

  private buildKeyPrefix(
    mediaType: RawUploadMediaType,
    userId: string,
    videoId: string
  ): string {
    return `${RAW_UPLOAD_KEY_PREFIX}/${mediaType}/${userId}/${videoId}`;
  }

  private buildKey(
    mediaType: RawUploadMediaType,
    userId: string,
    videoId: string
  ): string {
    const hash = crypto.randomBytes(4).toString('hex');
    return `${this.buildKeyPrefix(mediaType, userId, videoId)}-${hash}`;
  }

  isOwnedKey(
    key: string,
    mediaType: RawUploadMediaType,
    userId: string,
    videoId: string
  ): boolean {
    return key.startsWith(
      `${this.buildKeyPrefix(mediaType, userId, videoId)}-`
    );
  }

  async presignUpload(
    mediaType: RawUploadMediaType,
    userId: string,
    videoId: string,
    contentType: string,
    contentLength: number
  ): Promise<PresignUploadResult> {
    const key = this.buildKey(mediaType, userId, videoId);

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
      logger.warn(error, `S3: failed to delete object ${key}`);
    }
  }
}
