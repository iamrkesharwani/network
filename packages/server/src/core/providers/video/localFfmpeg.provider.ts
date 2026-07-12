import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  LOCAL_TRANSCODE_OUTPUT_CONTAINER,
  LOCAL_TRANSCODE_VIDEO_CODEC,
  LOCAL_TRANSCODE_AUDIO_CODEC,
  LOCAL_TRANSCODE_PIXEL_FORMAT,
  LOCAL_TRANSCODE_CRF,
  LOCAL_TRANSCODE_PRESET,
  LOCAL_TRANSCODE_AUDIO_BITRATE_KBPS,
  LOCAL_TRANSCODE_MOVFLAGS,
  LOCAL_TRANSCODE_THUMBNAIL_TIMESTAMP_SECONDS,
  PROCESSED_VIDEO_KEY_PREFIX,
  THUMBNAIL_KEY_PREFIX,
} from '@network/shared';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { transcodeDurationSeconds } from '../../metrics/queueMetrics.js';
import type {
  IngestVideoResult,
  IStorageProvider,
  IVideoProvider,
  NormalizedWebhookPayload,
  WebhookVerifyParams,
} from '../types.js';

const execFileAsync = promisify(execFile);
const FFMPEG_EXEC_OPTIONS = { maxBuffer: 10 * 1024 * 1024 };

export interface LocalFfmpegConfig {
  processedStorage: IStorageProvider;
  publicBaseUrl: string;
}

export class LocalFfmpegVideoProvider implements IVideoProvider {
  private readonly processedStorage: IStorageProvider;
  private readonly publicBaseUrl: string;

  constructor(config: LocalFfmpegConfig) {
    this.processedStorage = config.processedStorage;
    this.publicBaseUrl = config.publicBaseUrl.replace(/\/+$/, '');
  }

  private buildProcessedKey(providerVideoId: string): string {
    return `${PROCESSED_VIDEO_KEY_PREFIX}/${providerVideoId}.${LOCAL_TRANSCODE_OUTPUT_CONTAINER}`;
  }

  private buildThumbnailKey(providerVideoId: string): string {
    return `${THUMBNAIL_KEY_PREFIX}/${providerVideoId}.jpg`;
  }

  async ingestFromUrl(params: {
    storageUrl: string;
    fileName: string;
    fileSizeBytes: number;
    userId: string;
  }): Promise<IngestVideoResult> {
    const providerVideoId = crypto.randomUUID();
    const workDir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'network-transcode-')
    );
    const outputPath = path.join(
      workDir,
      `output.${LOCAL_TRANSCODE_OUTPUT_CONTAINER}`
    );
    const thumbnailPath = path.join(workDir, 'thumbnail.jpg');

    try {
      const transcodeStartMs = Date.now();
      await execFileAsync(
        'ffmpeg',
        [
          '-y',
          '-hide_banner',
          '-loglevel',
          'error',
          '-i',
          params.storageUrl,
          '-c:v',
          LOCAL_TRANSCODE_VIDEO_CODEC,
          '-preset',
          LOCAL_TRANSCODE_PRESET,
          '-crf',
          String(LOCAL_TRANSCODE_CRF),
          '-pix_fmt',
          LOCAL_TRANSCODE_PIXEL_FORMAT,
          '-c:a',
          LOCAL_TRANSCODE_AUDIO_CODEC,
          '-b:a',
          `${LOCAL_TRANSCODE_AUDIO_BITRATE_KBPS}k`,
          '-movflags',
          LOCAL_TRANSCODE_MOVFLAGS,
          '-f',
          LOCAL_TRANSCODE_OUTPUT_CONTAINER,
          outputPath,
        ],
        FFMPEG_EXEC_OPTIONS
      );
      transcodeDurationSeconds.observe((Date.now() - transcodeStartMs) / 1000);

      const { stdout } = await execFileAsync(
        'ffprobe',
        [
          '-v',
          'error',
          '-show_entries',
          'format=duration',
          '-of',
          'default=noprint_wrappers=1:nokey=1',
          outputPath,
        ],
        FFMPEG_EXEC_OPTIONS
      );
      const duration = Math.round(parseFloat(stdout.trim()));

      const seekSeconds = Math.min(
        LOCAL_TRANSCODE_THUMBNAIL_TIMESTAMP_SECONDS,
        Math.max(duration - 0.1, 0)
      );

      await execFileAsync(
        'ffmpeg',
        [
          '-y',
          '-hide_banner',
          '-loglevel',
          'error',
          '-ss',
          String(seekSeconds),
          '-i',
          outputPath,
          '-frames:v',
          '1',
          '-f',
          'image2',
          thumbnailPath,
        ],
        FFMPEG_EXEC_OPTIONS
      );

      const [videoBuffer, thumbnailBuffer] = await Promise.all([
        fs.readFile(outputPath),
        fs.readFile(thumbnailPath),
      ]);

      const processedKey = this.buildProcessedKey(providerVideoId);
      const thumbnailKey = this.buildThumbnailKey(providerVideoId);

      await Promise.all([
        this.processedStorage.uploadObject(
          processedKey,
          videoBuffer,
          'video/mp4'
        ),
        this.processedStorage.uploadObject(
          thumbnailKey,
          thumbnailBuffer,
          'image/jpeg'
        ),
      ]);

      const readyPayload: NormalizedWebhookPayload = {
        providerVideoId,
        status: 'READY',
        duration,
        playbackUrl: this.buildPlaybackUrl(providerVideoId),
        thumbnailUrl: this.buildThumbnailUrl(providerVideoId),
      };

      return { providerVideoId, readyPayload };
    } catch (error) {
      logger.error(
        error,
        `Local ffmpeg: transcode failed for "${params.fileName}"`
      );
      throw new ApiError(
        500,
        'INTERNAL_SERVER_ERROR',
        'Local video transcoding failed.'
      );
    } finally {
      await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  async deleteVideo(providerVideoId: string): Promise<void> {
    await Promise.all([
      this.processedStorage.deleteObject(
        this.buildProcessedKey(providerVideoId)
      ),
      this.processedStorage.deleteObject(
        this.buildThumbnailKey(providerVideoId)
      ),
    ]);
  }

  buildPlaybackUrl(providerVideoId: string): string {
    return `${this.publicBaseUrl}/${this.buildProcessedKey(providerVideoId)}`;
  }

  buildThumbnailUrl(providerVideoId: string): string {
    return `${this.publicBaseUrl}/${this.buildThumbnailKey(providerVideoId)}`;
  }

  async verifyWebhookSignature(
    _params: WebhookVerifyParams
  ): Promise<boolean> {
    return false;
  }

  parseWebhookPayload(_body: unknown): NormalizedWebhookPayload | null {
    return null;
  }
}
