import { Worker, type Job } from 'bullmq';
import {
  MEDIA_INGEST_QUEUE_NAME,
  MEDIA_STATUS_SOCKET_EVENT,
  type IMediaStatusEvent,
} from '@network/shared';
import { bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';
import { emitToUser } from '../../core/config/socket.js';
import { storageProvider } from '../../core/providers/provider.js';
import {
  mediaIngestJobDurationSeconds,
  mediaIngestJobFailuresTotal,
} from '../../core/metrics/queueMetrics.js';
import { setProviderMediaType } from '../webhook/provider-media-index.repository.js';
import { getMediaAdapter } from './upload.media.registry.js';
import { ingestFromStorage } from './services/upload.ingest.service.js';
import type { MediaIngestJobData } from './upload.ingest.queue.js';

const processIngestJob = async (
  job: Job<MediaIngestJobData>
): Promise<void> => {
  const jobStartMs = Date.now();
  const { mediaType, mediaId, userId, storageKey, fileName, fileSizeBytes } =
    job.data;

  const { providerVideoId, readyPayload } = await ingestFromStorage({
    storageKey,
    fileName,
    fileSizeBytes,
    userId,
  });

  await setProviderMediaType(providerVideoId, mediaType);

  const adapter = getMediaAdapter(mediaType);
  const marked = await adapter.markProcessing(mediaId, {
    providerVideoId,
    storageKey,
  });

  if (!marked) {
    logger.warn(
      `Media ingest: placeholder ${mediaId} (${mediaType}) vanished before it could be marked processing`
    );
    mediaIngestJobDurationSeconds.observe((Date.now() - jobStartMs) / 1000);
    return;
  }

  const statusEvent: IMediaStatusEvent = {
    id: mediaId,
    mediaType,
    status: 'PROCESSING',
  };
  emitToUser(userId, MEDIA_STATUS_SOCKET_EVENT, statusEvent);

  if (readyPayload) {
    await adapter.processReadyPayload(readyPayload);

    await storageProvider.deleteObject(storageKey).catch((e) =>
      logger.warn(
        e,
        `Failed to delete raw upload object ${storageKey} after successful transcode`
      )
    );
  }

  mediaIngestJobDurationSeconds.observe((Date.now() - jobStartMs) / 1000);
};

export const startMediaIngestWorker = (): Worker<MediaIngestJobData> => {
  const worker = new Worker<MediaIngestJobData>(
    MEDIA_INGEST_QUEUE_NAME,
    processIngestJob,
    {
      connection: bullMqConnection,
      concurrency: 10,
    }
  );

  worker.on('failed', async (job, error) => {
    if (!job) return;

    const isFinal = job.attemptsMade >= (job.opts.attempts ?? 1);
    const level = isFinal ? 'error' : 'warn';
    logger[level](
      error,
      `Media ingest job ${isFinal ? 'dead-lettered' : 'will retry'}: mediaId=${job.data.mediaId} attempt=${job.attemptsMade}/${job.opts.attempts}`
    );

    if (!isFinal) return;

    mediaIngestJobFailuresTotal.inc();

    try {
      const adapter = getMediaAdapter(job.data.mediaType);
      await adapter.markFailed(
        job.data.mediaId,
        'We could not process this upload. Please try uploading again.'
      );

      await storageProvider.deleteObject(job.data.storageKey).catch((e) =>
        logger.warn(
          e,
          `Failed to delete raw upload object ${job.data.storageKey} after exhausted ingest retries`
        )
      );

      const statusEvent: IMediaStatusEvent = {
        id: job.data.mediaId,
        mediaType: job.data.mediaType,
        status: 'FAILED',
        errorMessage: 'We could not process this upload. Please try again.',
      };
      emitToUser(job.data.userId, MEDIA_STATUS_SOCKET_EVENT, statusEvent);
    } catch (markError) {
      logger.error(
        markError,
        `Failed to mark media ${job.data.mediaId} as FAILED after exhausting ingest retries`
      );
    }
  });

  worker.on('error', (error) => {
    logger.error(error, 'Media ingest worker connection error');
  });

  logger.info('Media ingest worker started (concurrency=10)');
  return worker;
};
