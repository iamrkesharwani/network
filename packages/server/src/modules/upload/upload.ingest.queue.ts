import { Queue } from 'bullmq';
import {
  MEDIA_INGEST_QUEUE_NAME,
  type MultipartMediaType,
} from '@network/shared';
import { bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';

export interface MediaIngestJobData {
  mediaType: MultipartMediaType;
  mediaId: string;
  userId: string;
  storageKey: string;
  fileName: string;
  fileSizeBytes: number;
}

const mediaIngestQueue = new Queue<MediaIngestJobData>(
  MEDIA_INGEST_QUEUE_NAME,
  {
    connection: bullMqConnection,
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 10_000 },
      removeOnComplete: { count: 500 },
      removeOnFail: { count: 1000 },
    },
  }
);

export const enqueueMediaIngest = async (
  data: MediaIngestJobData
): Promise<void> => {
  try {
    await mediaIngestQueue.add('ingest', data, { jobId: data.mediaId });
    logger.info(
      `Media ingest job enqueued: mediaType=${data.mediaType} mediaId=${data.mediaId}`
    );
  } catch (error) {
    logger.error(
      error,
      `Failed to enqueue media ingest job: mediaId=${data.mediaId}`
    );
    throw error;
  }
};
