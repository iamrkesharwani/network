import { execFile, spawn } from 'node:child_process';
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
  LOCAL_TRANSCODE_PROGRESS_MIN_INTERVAL_MS,
  PROCESSED_VIDEO_KEY_PREFIX,
  THUMBNAIL_KEY_PREFIX,
  FFMPEG_EXEC_OPTIONS,
  FFMPEG_STDERR_TAIL_MAX_CHARS,
} from '@network/shared';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { transcodeDurationSeconds } from '../../metrics/queueMetrics.js';
import type {
  IngestVideoResult,
  IPublicUrlStorageProvider,
  IVideoProvider,
  NormalizedWebhookPayload,
  WebhookVerifyParams,
} from '../types.js';

const execFileAsync = promisify(execFile);

const parseFfmpegTimeToSeconds = (value: string): number | null => {
  const match = /^(\d+):(\d{2}):(\d{2}(?:\.\d+)?)$/.exec(value.trim());
  if (!match) return null;
  const [, hours, minutes, seconds] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};

export interface LocalFfmpegConfig {
  processedStorage: IPublicUrlStorageProvider;
}

export class LocalFfmpegVideoProvider implements IVideoProvider {
  private readonly processedStorage: IPublicUrlStorageProvider;

  constructor(config: LocalFfmpegConfig) {
    this.processedStorage = config.processedStorage;
  }

  private buildProcessedKey(providerVideoId: string): string {
    return `${PROCESSED_VIDEO_KEY_PREFIX}/${providerVideoId}.${LOCAL_TRANSCODE_OUTPUT_CONTAINER}`;
  }

  private buildThumbnailKey(providerVideoId: string): string {
    return `${THUMBNAIL_KEY_PREFIX}/${providerVideoId}.jpg`;
  }

  private async probeDurationSeconds(url: string): Promise<number | null> {
    try {
      const { stdout } = await execFileAsync(
        'ffprobe',
        [
          '-v',
          'error',
          '-show_entries',
          'format=duration',
          '-of',
          'default=noprint_wrappers=1:nokey=1',
          url,
        ],
        FFMPEG_EXEC_OPTIONS
      );
      const value = parseFloat(stdout.trim());
      return Number.isFinite(value) && value > 0 ? value : null;
    } catch {
      return null;
    }
  }

  private runFfmpegWithProgress(
    args: string[],
    inputDurationSeconds: number | null,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn('ffmpeg', args);

      let stdoutTail = '';
      let stderrTail = '';
      let lastEmittedPercent = -1;
      let lastEmitTimeMs = 0;

      child.stdout.on('data', (chunk: Buffer) => {
        if (!onProgress || !inputDurationSeconds) return;

        stdoutTail += chunk.toString();
        const lines = stdoutTail.split('\n');
        stdoutTail = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('out_time=')) continue;

          const seconds = parseFfmpegTimeToSeconds(
            line.slice('out_time='.length)
          );
          if (seconds === null) continue;

          const percent = Math.min(
            99,
            Math.max(0, Math.round((seconds / inputDurationSeconds) * 100))
          );

          const now = Date.now();
          const dueForEmit =
            now - lastEmitTimeMs >= LOCAL_TRANSCODE_PROGRESS_MIN_INTERVAL_MS;

          if (percent !== lastEmittedPercent && dueForEmit) {
            lastEmittedPercent = percent;
            lastEmitTimeMs = now;
            onProgress(percent);
          }
        }
      });

      child.stderr.on('data', (chunk: Buffer) => {
        stderrTail = (stderrTail + chunk.toString()).slice(
          -FFMPEG_STDERR_TAIL_MAX_CHARS
        );
      });

      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ffmpeg exited with code ${code}: ${stderrTail}`));
        }
      });
    });
  }

  async ingestFromUrl(params: {
    storageUrl: string;
    fileName: string;
    fileSizeBytes: number;
    userId: string;
    onProgress?: (percent: number) => void;
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
      const inputDurationSeconds = await this.probeDurationSeconds(
        params.storageUrl
      );

      const transcodeStartMs = Date.now();
      await this.runFfmpegWithProgress(
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
          '-progress',
          'pipe:1',
          '-nostats',
          outputPath,
        ],
        inputDurationSeconds,
        params.onProgress
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
    return this.processedStorage.buildPublicUrl(
      this.buildProcessedKey(providerVideoId)
    );
  }

  buildThumbnailUrl(providerVideoId: string): string {
    return this.processedStorage.buildPublicUrl(
      this.buildThumbnailKey(providerVideoId)
    );
  }

  async verifyWebhookSignature(_params: WebhookVerifyParams): Promise<boolean> {
    return false;
  }

  parseWebhookPayload(_body: unknown): NormalizedWebhookPayload | null {
    return null;
  }
}
