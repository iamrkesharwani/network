import crypto from 'node:crypto';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import type {
  IVideoProvider,
  IngestVideoResult,
  WebhookVerifyParams,
  NormalizedWebhookPayload,
} from '../types.js';
import {
  WEBHOOK_SIGNATURE_TOLERANCE_SECONDS,
  type VideoStatus,
} from '@network/shared';

export interface MuxConfig {
  tokenId: string;
  tokenSecret: string;
  webhookSecret: string;
}

const STATUS_MAP: Record<string, VideoStatus> = {
  waiting: 'PROCESSING',
  preparing: 'PROCESSING',
  ready: 'READY',
  errored: 'FAILED',
};

export class MuxVideoProvider implements IVideoProvider {
  private readonly authHeader: string;
  private readonly webhookSecret: string;
  private static readonly API_BASE = 'https://api.mux.com';

  constructor(config: MuxConfig) {
    const encoded = Buffer.from(
      `${config.tokenId}:${config.tokenSecret}`
    ).toString('base64');
    this.authHeader = `Basic ${encoded}`;
    this.webhookSecret = config.webhookSecret;
  }

  async ingestFromUrl(params: {
    storageUrl: string;
    fileName: string;
    fileSizeBytes: number;
    userId: string;
  }): Promise<IngestVideoResult> {
    let response: Response;
    try {
      response = await fetch(`${MuxVideoProvider.API_BASE}/video/v1/assets`, {
        method: 'POST',
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: [{ url: params.storageUrl }],
          playback_policy: ['public'],
          mp4_support: 'none',
          passthrough: params.userId,
        }),
      });
    } catch (error) {
      logger.error(error, 'Mux: failed to reach API');
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
        'Mux: asset creation failed'
      );
      throw new ApiError(
        502,
        'INTERNAL_SERVER_ERROR',
        'Video processing provider rejected the ingest request.'
      );
    }

    const json = (await response.json()) as { data?: { id?: string } };
    const providerVideoId = json?.data?.id;
    if (!providerVideoId) {
      throw new ApiError(
        502,
        'INTERNAL_SERVER_ERROR',
        'Mux returned an unexpected response.'
      );
    }

    return { providerVideoId };
  }

  async deleteVideo(providerVideoId: string): Promise<void> {
    try {
      const response = await fetch(
        `${MuxVideoProvider.API_BASE}/video/v1/assets/${providerVideoId}`,
        { method: 'DELETE', headers: { Authorization: this.authHeader } }
      );
      if (!response.ok && response.status !== 404) {
        const body = await response.text().catch(() => '');
        logger.warn(
          { providerVideoId, status: response.status, body },
          'Mux: delete failed'
        );
      }
    } catch (error) {
      logger.warn(error, `Mux: failed to delete asset ${providerVideoId}`);
    }
  }

  buildPlaybackUrl(providerVideoId: string): string {
    return `https://stream.mux.com/${providerVideoId}.m3u8`;
  }

  buildThumbnailUrl(providerVideoId: string): string {
    return `https://image.mux.com/${providerVideoId}/thumbnail.jpg`;
  }

  private static readonly WEBHOOK_TOLERANCE_SECONDS =
    WEBHOOK_SIGNATURE_TOLERANCE_SECONDS;

  verifyWebhookSignature({
    rawBody,
    signatureHeader,
  }: WebhookVerifyParams): boolean {
    if (!rawBody || !signatureHeader) return false;

    const parts: Record<string, string> = {};
    for (const pair of signatureHeader.split(',')) {
      const [k, v] = pair.split('=');
      if (k && v) parts[k.trim()] = v.trim();
    }

    if (!parts['t'] || !parts['v1']) return false;

    const timestamp = Number(parts['t']);
    if (!Number.isFinite(timestamp)) return false;

    const ageSeconds = Math.abs(Date.now() / 1000 - timestamp);
    if (ageSeconds > MuxVideoProvider.WEBHOOK_TOLERANCE_SECONDS) {
      return false;
    }

    const expected = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(`${parts['t']}.${rawBody.toString('utf-8')}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expected, 'hex');
    const receivedBuf = Buffer.from(parts['v1'], 'hex');
    return (
      receivedBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(receivedBuf, expectedBuf)
    );
  }

  parseWebhookPayload(body: unknown): NormalizedWebhookPayload | null {
    if (typeof body !== 'object' || body === null) return null;
    const b = body as Record<string, unknown>;

    if (typeof b['type'] !== 'string') return null;
    if (typeof b['data'] !== 'object' || b['data'] === null) return null;
    const data = b['data'] as Record<string, unknown>;

    if (typeof data['id'] !== 'string') return null;

    const rawStatus = typeof data['status'] === 'string' ? data['status'] : '';
    const status = STATUS_MAP[rawStatus] ?? 'FAILED';

    const playbackIds = data['playback_ids'];
    const playbackId =
      Array.isArray(playbackIds) && playbackIds.length > 0
        ? (playbackIds[0] as Record<string, unknown>)['id']
        : undefined;

    const duration =
      typeof data['duration'] === 'number' && data['duration'] >= 0
        ? data['duration']
        : undefined;

    const payload: NormalizedWebhookPayload = {
      providerVideoId: data['id'],
      status,
    };

    if (status === 'READY' && playbackId) {
      payload.playbackUrl = this.buildPlaybackUrl(playbackId as string);
      payload.thumbnailUrl = this.buildThumbnailUrl(playbackId as string);
    }

    if (duration !== undefined) {
      payload.duration = duration;
    }

    if (status === 'FAILED') {
      payload.errorMessage =
        typeof data['errors'] === 'object' && data['errors'] !== null
          ? JSON.stringify(data['errors'])
          : 'Mux reported a processing error.';
    }

    return payload;
  }
}
