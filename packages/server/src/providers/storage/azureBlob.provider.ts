import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from '@azure/storage-blob';
import {
  RAW_UPLOAD_KEY_PREFIX,
  RAW_UPLOAD_PRESIGNED_URL_TTL_SECONDS,
} from '@network/shared';
import { logger } from '../../utils/logger.js';
import type { IStorageProvider, PresignUploadResult } from '../types.js';

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

  private buildKey(userId: string, videoId: string): string {
    return `${RAW_UPLOAD_KEY_PREFIX}/${userId}/${videoId}`;
  }

  isOwnedKey(key: string, userId: string, videoId: string): boolean {
    return key === this.buildKey(userId, videoId);
  }

  async presignUpload(
    userId: string,
    videoId: string,
    contentType: string
  ): Promise<PresignUploadResult> {
    const key = this.buildKey(userId, videoId);

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
    const expiresOn = new Date(Date.now() + 6 * 60 * 60 * 1000);
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
}
