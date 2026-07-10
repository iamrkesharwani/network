import {
  WEBHOOK_SIGNATURE_TOLERANCE_SECONDS,
  type VideoStatus,
} from '@network/shared';
import type {
  IngestVideoResult,
  IVideoProvider,
  NormalizedWebhookPayload,
  WebhookVerifyParams,
} from '../types.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';
import crypto from 'node:crypto';

export interface CloudflareStreamConfig {
  accountId: string;
  apiToken: string;
  webhookSecret: string;
  customerCode: string;
}

const STATE_MAP: Record<string, VideoStatus> = {
  pendingupload: 'PROCESSING',
  downloading: 'PROCESSING',
  queued: 'PROCESSING',
  inprogress: 'PROCESSING',
  ready: 'READY',
  error: 'FAILED',
};

export class CloudflareStreamVideoProvider implements IVideoProvider {
  private readonly apiUrl: string;
  private readonly authHeader: Record<string, string>;
  private readonly webhookSecret: string;
  private readonly customerCode: string;

  constructor(config: CloudflareStreamConfig) {
    this.apiUrl = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/stream`;
    this.authHeader = { Authorization: `Bearer ${config.apiToken}` };
    this.webhookSecret = config.webhookSecret;
    this.customerCode = config.customerCode;
  }

  async ingestFromUrl(params: {
    storageUrl: string;
    fileName: string;
    fileSizeBytes: number;
    userId: string;
  }): Promise<IngestVideoResult> {
    let response: Response;
    try {
      response = await fetch(`${this.apiUrl}/copy`, {
        method: 'POST',
        headers: { ...this.authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: params.storageUrl,
          meta: { name: params.fileName },
        }),
      });
    } catch (error) {
      logger.error(error, 'CF Stream: failed to reach API');
      throw new ApiError(
        502,
        'INTERNAL_SERVER_ERROR',
        'Could not reach the video processing provider.'
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      logger.error(
        { status: response.status, body },
        'CF Stream: ingest request failed'
      );
      throw new ApiError(
        502,
        'INTERNAL_SERVER_ERROR',
        'Video processing provider rejected the ingest request.'
      );
    }

    const json = (await response.json()) as { result?: { uid?: string } };
    const providerVideoId = json?.result?.uid;
    if (!providerVideoId) {
      throw new ApiError(
        502,
        'INTERNAL_SERVER_ERROR',
        'Video processing provider returned an unexpected response.'
      );
    }

    return { providerVideoId };
  }

  async deleteVideo(providerVideoId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${providerVideoId}`, {
        method: 'DELETE',
        headers: this.authHeader,
      });
      if (!response.ok && response.status !== 404) {
        const body = await response.text().catch(() => '');
        logger.warn(
          { providerVideoId, status: response.status, body },
          'CF Stream: delete failed'
        );
      }
    } catch (error) {
      logger.warn(
        error,
        `CF Stream: failed to delete video ${providerVideoId}`
      );
    }
  }

  buildPlaybackUrl(providerVideoId: string): string {
    return `https://customer-${this.customerCode}.cloudflarestream.com/${providerVideoId}/manifest/video.m3u8`;
  }

  buildThumbnailUrl(providerVideoId: string): string {
    return `https://customer-${this.customerCode}.cloudflarestream.com/${providerVideoId}/thumbnails/thumbnail.jpg`;
  }

  private static readonly WEBHOOK_TOLERANCE_SECONDS =
    WEBHOOK_SIGNATURE_TOLERANCE_SECONDS;

  async verifyWebhookSignature({
    rawBody,
    signatureHeader,
  }: WebhookVerifyParams): Promise<boolean> {
    if (!rawBody || !signatureHeader) return false;

    const parts = new Map<string, string[]>();
    for (const segment of signatureHeader.split(',')) {
      const [key, value] = segment.split('=');
      if (!key || !value) continue;
      parts.set(key, [...(parts.get(key) ?? []), value]);
    }

    const time = parts.get('time')?.[0];
    const signatures = parts.get('sig1');
    if (!time || !signatures?.length) return false;

    const timestamp = Number(time);
    if (!Number.isFinite(timestamp)) return false;

    const ageSeconds = Math.abs(Date.now() / 1000 - timestamp);
    if (ageSeconds > CloudflareStreamVideoProvider.WEBHOOK_TOLERANCE_SECONDS) {
      return false;
    }

    const expected = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(`${time}.${rawBody.toString('utf-8')}`)
      .digest('hex');
    const expectedBuf = Buffer.from(expected, 'hex');

    return signatures.some((sig) => {
      const sigBuf = Buffer.from(sig, 'hex');
      return (
        sigBuf.length === expectedBuf.length &&
        crypto.timingSafeEqual(sigBuf, expectedBuf)
      );
    });
  }

  parseWebhookPayload(body: unknown): NormalizedWebhookPayload | null {
    if (typeof body !== 'object' || body === null) return null;
    const b = body as Record<string, unknown>;

    if (typeof b['uid'] !== 'string') return null;
    const statusObj = b['status'];
    if (typeof statusObj !== 'object' || statusObj === null) return null;
    const s = statusObj as Record<string, unknown>;
    if (typeof s['state'] !== 'string') return null;

    const status = STATE_MAP[s['state']] ?? 'FAILED';

    const payload: NormalizedWebhookPayload = {
      providerVideoId: b['uid'],
      status,
    };

    if (status === 'READY') {
      payload.playbackUrl = this.buildPlaybackUrl(b['uid']);
      payload.thumbnailUrl = this.buildThumbnailUrl(b['uid']);
    }

    if (typeof b['duration'] === 'number' && b['duration'] >= 0) {
      payload.duration = b['duration'];
    }

    if (status === 'FAILED' && typeof s['errorReasonText'] === 'string') {
      payload.errorMessage = s['errorReasonText'];
    }

    return payload;
  }
}
