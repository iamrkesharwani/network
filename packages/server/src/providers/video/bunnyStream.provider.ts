import type { VideoStatus } from '../../../../shared/src/index.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import type {
  IngestVideoResult,
  IVideoProvider,
  NormalizedWebhookPayload,
  WebhookVerifyParams,
} from '../types.js';
import crypto from 'node:crypto';

export interface BunnyStreamConfig {
  libraryId: string;
  apiKey: string;
  cdnHostname: string;
  webhookSecret: string;
}

const BunnyVideoStatus = {
  Queued: 0,
  Processing: 1,
  Encoding: 2,
  Finished: 3,
  ResolutionFinished: 4,
  Failed: 5,
  PresignedUploadStarted: 6,
  PresignedUploadFinished: 7,
  PresignedUploadFailed: 8,
  CaptionsGenerated: 9,
  TitleOrDescriptionGenerated: 10,
} as const;

const STATUS_MAP: Record<number, VideoStatus> = {
  [BunnyVideoStatus.Queued]: 'PROCESSING',
  [BunnyVideoStatus.Processing]: 'PROCESSING',
  [BunnyVideoStatus.Encoding]: 'PROCESSING',
  [BunnyVideoStatus.Finished]: 'READY',
  [BunnyVideoStatus.ResolutionFinished]: 'READY',
  [BunnyVideoStatus.Failed]: 'FAILED',
  [BunnyVideoStatus.PresignedUploadStarted]: 'PROCESSING',
  [BunnyVideoStatus.PresignedUploadFinished]: 'PROCESSING',
  [BunnyVideoStatus.PresignedUploadFailed]: 'FAILED',
  [BunnyVideoStatus.CaptionsGenerated]: 'PROCESSING',
  [BunnyVideoStatus.TitleOrDescriptionGenerated]: 'PROCESSING',
};

export class BunnyStreamVideoProvider implements IVideoProvider {
  private readonly libraryId: string;
  private readonly apiKey: string;
  private readonly cdnHostname: string;
  private readonly webhookSecret: string;
  private static readonly API_BASE = 'https://video.bunnycdn.com/library';

  constructor(config: BunnyStreamConfig) {
    this.libraryId = config.libraryId;
    this.apiKey = config.apiKey;
    this.cdnHostname = config.cdnHostname;
    this.webhookSecret = config.webhookSecret;
  }

  private get headers(): Record<string, string> {
    return {
      AccessKey: this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  private get apiBase(): string {
    return `${BunnyStreamVideoProvider.API_BASE}/${this.libraryId}`;
  }

  async ingestFromUrl(params: {
    storageUrl: string;
    fileName: string;
    fileSizeBytes: number;
    userId: string;
  }): Promise<IngestVideoResult> {
    let createRes: Response;
    try {
      createRes = await fetch(`${this.apiBase}/videos`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ title: params.fileName }),
      });
    } catch (error) {
      logger.error(error, 'Bunny Stream: failed to reach API (create)');
      throw new ApiError(
        502,
        'INTERNAL_SERVER_ERROR',
        'Could not reach the video processing provider.'
      );
    }

    if (!createRes.ok) {
      const body = await createRes.text().catch(() => '');
      logger.error(
        { status: createRes.status, body },
        'Bunny Stream: video create failed'
      );
      throw new ApiError(
        502,
        'INTERNAL_SERVER_ERROR',
        'Video processing provider rejected the create request.'
      );
    }

    const createJson = (await createRes.json()) as { guid?: string };
    const videoGuid = createJson?.guid;
    if (!videoGuid) {
      throw new ApiError(
        502,
        'INTERNAL_SERVER_ERROR',
        'Bunny Stream returned an unexpected response.'
      );
    }

    let fetchRes: Response;
    try {
      fetchRes = await fetch(`${this.apiBase}/videos/${videoGuid}/fetch`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ url: params.storageUrl }),
      });
    } catch (error) {
      logger.error(error, 'Bunny Stream: failed to reach API (fetch)');
      throw new ApiError(
        502,
        'INTERNAL_SERVER_ERROR',
        'Could not reach the video processing provider.'
      );
    }

    if (!fetchRes.ok) {
      const body = await fetchRes.text().catch(() => '');
      logger.error(
        { status: fetchRes.status, body, videoGuid },
        'Bunny Stream: fetch-from-url failed'
      );
      throw new ApiError(
        502,
        'INTERNAL_SERVER_ERROR',
        'Video processing provider could not fetch the video.'
      );
    }

    return { providerVideoId: videoGuid };
  }

  async deleteVideo(providerVideoId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.apiBase}/videos/${providerVideoId}`,
        {
          method: 'DELETE',
          headers: this.headers,
        }
      );
      if (!response.ok && response.status !== 404) {
        const body = await response.text().catch(() => '');
        logger.warn(
          { providerVideoId, status: response.status, body },
          'Bunny Stream: delete failed'
        );
      }
    } catch (error) {
      logger.warn(
        error,
        `Bunny Stream: failed to delete video ${providerVideoId}`
      );
    }
  }

  buildPlaybackUrl(providerVideoId: string): string {
    return `https://${this.cdnHostname}/${providerVideoId}/playlist.m3u8`;
  }

  buildThumbnailUrl(providerVideoId: string): string {
    return `https://${this.cdnHostname}/${providerVideoId}/thumbnail.jpg`;
  }

  verifyWebhookSignature({
    rawBody,
    signatureHeader,
  }: WebhookVerifyParams): boolean {
    if (!rawBody || !signatureHeader) return false;

    const expected = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expected, 'hex');
    const receivedBuf = Buffer.from(signatureHeader, 'hex');
    return (
      receivedBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(receivedBuf, expectedBuf)
    );
  }

  parseWebhookPayload(body: unknown): NormalizedWebhookPayload | null {
    if (typeof body !== 'object' || body === null) return null;
    const b = body as Record<string, unknown>;

    if (typeof b['VideoGuid'] !== 'string') return null;
    if (typeof b['Status'] !== 'number') return null;

    const status = STATUS_MAP[b['Status'] as number] ?? 'FAILED';
    const duration =
      typeof b['Duration'] === 'number' && b['Duration'] >= 0
        ? b['Duration']
        : undefined;

    const payload: NormalizedWebhookPayload = {
      providerVideoId: b['VideoGuid'],
      status,
    };

    if (status === 'READY') {
      payload.playbackUrl = this.buildPlaybackUrl(b['VideoGuid']);
      payload.thumbnailUrl = this.buildThumbnailUrl(b['VideoGuid']);
    }

    if (duration !== undefined) {
      payload.duration = duration;
    }

    if (status === 'FAILED') {
      payload.errorMessage = 'Bunny Stream reported a processing error.';
    }

    return payload;
  }
}
