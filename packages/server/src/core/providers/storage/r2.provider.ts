import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'node:crypto';
import {
  RAW_UPLOAD_KEY_PREFIX,
  RAW_UPLOAD_PRESIGNED_URL_TTL_SECONDS,
  MEDIA_ACCESS_URL_TTL_SECONDS,
} from '@network/shared';
import { logger } from '../../utils/logger.js';
import type {
  IStorageProvider,
  PresignUploadResult,
  RawUploadMediaType,
  CreateMultipartUploadResult,
  PresignPartResult,
  CompletedUploadPart,
} from '../types.js';

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
      { expiresIn: MEDIA_ACCESS_URL_TTL_SECONDS }
    );
  }

  async uploadObject(
    key: string,
    body: Buffer,
    contentType: string
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      })
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

  async createMultipartUpload(
    mediaType: RawUploadMediaType,
    userId: string,
    videoId: string,
    contentType: string
  ): Promise<CreateMultipartUploadResult> {
    const key = this.buildKey(mediaType, userId, videoId);

    const result = await this.client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      })
    );

    if (!result.UploadId) {
      throw new Error('R2: CreateMultipartUpload did not return an UploadId.');
    }

    return { storageKey: key, providerUploadId: result.UploadId };
  }

  async presignPart(
    storageKey: string,
    providerUploadId: string,
    partNumber: number
  ): Promise<PresignPartResult> {
    const command = new UploadPartCommand({
      Bucket: this.bucketName,
      Key: storageKey,
      UploadId: providerUploadId,
      PartNumber: partNumber,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: RAW_UPLOAD_PRESIGNED_URL_TTL_SECONDS,
    });

    return { uploadUrl };
  }

  async completeMultipartUpload(
    storageKey: string,
    providerUploadId: string,
    parts: CompletedUploadPart[]
  ): Promise<void> {
    const sortedParts = [...parts].sort((a, b) => a.partNumber - b.partNumber);

    await this.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.bucketName,
        Key: storageKey,
        UploadId: providerUploadId,
        MultipartUpload: {
          Parts: sortedParts.map((part) => ({
            PartNumber: part.partNumber,
            ETag: part.etag,
          })),
        },
      })
    );
  }

  async abortMultipartUpload(
    storageKey: string,
    providerUploadId: string
  ): Promise<void> {
    try {
      await this.client.send(
        new AbortMultipartUploadCommand({
          Bucket: this.bucketName,
          Key: storageKey,
          UploadId: providerUploadId,
        })
      );
    } catch (error) {
      logger.warn(
        error,
        `R2: failed to abort multipart upload ${storageKey} (${providerUploadId})`
      );
    }
  }
}
