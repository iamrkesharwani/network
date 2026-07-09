import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';
import crypto from 'node:crypto';
import {
  RAW_UPLOAD_KEY_PREFIX,
  RAW_UPLOAD_PRESIGNED_URL_TTL_SECONDS,
  MULTIPART_SESSION_TTL_SECONDS,
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

export interface AzureBlobConfig {
  accountName: string;
  accountKey: string;
  containerName: string;
}

export class AzureBlobStorageProvider implements IStorageProvider {
  private readonly client: BlobServiceClient;
  private readonly credential: StorageSharedKeyCredential;
  private readonly containerName: string;
  private readonly accountName: string;

  constructor(config: AzureBlobConfig) {
    this.accountName = config.accountName;
    this.containerName = config.containerName;
    this.credential = new StorageSharedKeyCredential(
      config.accountName,
      config.accountKey
    );
    this.client = new BlobServiceClient(
      `https://${config.accountName}.blob.core.windows.net`,
      this.credential
    );
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
    contentType: string
  ): Promise<PresignUploadResult> {
    const key = this.buildKey(mediaType, userId, videoId);

    const expiresOn = new Date(
      Date.now() + RAW_UPLOAD_PRESIGNED_URL_TTL_SECONDS * 1000
    );

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: key,
        permissions: BlobSASPermissions.parse('w'),
        expiresOn,
        contentType,
      },
      this.credential
    ).toString();

    const url = `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${key}?${sasToken}`;
    return { url, key };
  }

  async buildAccessUrl(key: string): Promise<string> {
    const expiresOn = new Date(
      Date.now() + MEDIA_ACCESS_URL_TTL_SECONDS * 1000
    );
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: key,
        permissions: BlobSASPermissions.parse('r'),
        expiresOn,
      },
      this.credential
    ).toString();
    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${key}?${sasToken}`;
  }

  async deleteObject(key: string): Promise<void> {
    try {
      const containerClient = this.client.getContainerClient(
        this.containerName
      );
      await containerClient.deleteBlob(key);
    } catch (error) {
      logger.warn(error, `Azure Blob: failed to delete blob ${key}`);
    }
  }

  private buildBlockId(partNumber: number): string {
    const padded = String(partNumber).padStart(6, '0');
    return Buffer.from(padded).toString('base64');
  }

  async createMultipartUpload(
    mediaType: RawUploadMediaType,
    userId: string,
    videoId: string,
    _contentType: string
  ): Promise<CreateMultipartUploadResult> {
    const key = this.buildKey(mediaType, userId, videoId);
    const providerUploadId = crypto.randomBytes(16).toString('hex');
    return { storageKey: key, providerUploadId };
  }

  async presignPart(
    storageKey: string,
    _providerUploadId: string,
    partNumber: number
  ): Promise<PresignPartResult> {
    const blockId = this.buildBlockId(partNumber);

    const expiresOn = new Date(
      Date.now() + MULTIPART_SESSION_TTL_SECONDS * 1000
    );

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: storageKey,
        permissions: BlobSASPermissions.parse('w'),
        expiresOn,
      },
      this.credential
    ).toString();

    const uploadUrl =
      `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${storageKey}` +
      `?comp=block&blockid=${encodeURIComponent(blockId)}&${sasToken}`;

    return { uploadUrl, blockId };
  }

  async completeMultipartUpload(
    storageKey: string,
    _providerUploadId: string,
    parts: CompletedUploadPart[]
  ): Promise<void> {
    const blockIds = [...parts]
      .sort((a, b) => a.partNumber - b.partNumber)
      .map((part) => this.buildBlockId(part.partNumber));

    const containerClient = this.client.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(storageKey);

    await blockBlobClient.commitBlockList(blockIds);
  }

  async abortMultipartUpload(
    storageKey: string,
    _providerUploadId: string
  ): Promise<void> {
    try {
      const containerClient = this.client.getContainerClient(
        this.containerName
      );
      await containerClient.deleteBlob(storageKey);
    } catch (error) {
      logger.warn(
        error,
        `Azure Blob: failed to abort multipart upload ${storageKey}`
      );
    }
  }
}
