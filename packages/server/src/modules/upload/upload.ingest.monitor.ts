import {
  MEDIA_INGEST_BACKLOG_ALERT_THRESHOLD,
  MEDIA_INGEST_BACKLOG_CHECK_INTERVAL_MS,
} from '@network/shared';
import { mediaIngestQueueDepth } from '../../core/metrics/queueMetrics.js';
import { mediaIngestQueue } from './upload.ingest.queue.js';
import { logger } from '../../core/utils/logger.js';

const checkBacklog = async (): Promise<void> => {
  try {
    const counts = await mediaIngestQueue.getJobCounts(
      'waiting',
      'active',
      'delayed',
      'failed'
    );

    for (const [state, count] of Object.entries(counts)) {
      mediaIngestQueueDepth.set({ state }, count);
    }

    const backlog = (counts['waiting'] ?? 0) + (counts['active'] ?? 0);
    if (backlog > MEDIA_INGEST_BACKLOG_ALERT_THRESHOLD) {
      logger.error(
        { backlog, threshold: MEDIA_INGEST_BACKLOG_ALERT_THRESHOLD },
        `Media ingest queue backlog (${backlog}) exceeds alert threshold — worker may be under-provisioned`
      );
    }
  } catch (error) {
    logger.warn(error, 'Failed to check media ingest queue backlog');
  }
};

export const startQueueBacklogMonitor = (): NodeJS.Timeout => {
  void checkBacklog();
  return setInterval(() => void checkBacklog(), MEDIA_INGEST_BACKLOG_CHECK_INTERVAL_MS);
};
