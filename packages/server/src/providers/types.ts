import type { VideoStatus } from '@network/shared';

export type RawUploadMediaType = 'video' | 'short';

export interface PresignUploadResult {
  url: string;
  key: string;
}

export interface IStorageProvider {
  presignUpload(
    mediaType: RawUploadMediaType,
    userId: string,
    videoId: string,
    contentType: string,
    contentLength: number
  ): Promise<PresignUploadResult>;

  buildAccessUrl(key: string): Promise<string>;

  deleteObject(key: string): Promise<void>;

  isOwnedKey(
    key: string,
    mediaType: RawUploadMediaType,
    userId: string,
    videoId: string
  ): boolean;
}

export interface IngestVideoResult {
  providerVideoId: string;
}

export interface WebhookVerifyParams {
  rawBody: Buffer | undefined;
  signatureHeader: string | undefined;
}

export interface NormalizedWebhookPayload {
  providerVideoId: string;
  status: VideoStatus;
  playbackUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  errorMessage?: string;
}

export interface IVideoProvider {
  ingestFromUrl(params: {
    storageUrl: string;
    fileName: string;
    fileSizeBytes: number;
    userId: string;
  }): Promise<IngestVideoResult>;

  deleteVideo(providerVideoId: string): Promise<void>;

  buildPlaybackUrl(providerVideoId: string): string;

  buildThumbnailUrl(providerVideoId: string): string;

  verifyWebhookSignature(params: WebhookVerifyParams): boolean;

  parseWebhookPayload(body: unknown): NormalizedWebhookPayload | null;
}

export interface IImageProvider {
  uploadImage(buffer: Buffer, mimeType: string): Promise<string>;

  deleteImage(urlOrKey: string): Promise<void>;
}
