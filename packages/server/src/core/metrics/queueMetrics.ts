import { Counter, Gauge, Histogram, register } from 'prom-client';

const DURATION_BUCKETS_SECONDS = [1, 5, 15, 30, 60, 120, 300, 600, 1200, 1800];

export const transcodeDurationSeconds = new Histogram({
  name: 'local_transcode_duration_seconds',
  help: 'Wall-clock time spent in the ffmpeg transcode step per job — the dominant proxy for CPU time on a single-threaded-per-job worker',
  buckets: DURATION_BUCKETS_SECONDS,
});

export const mediaIngestJobDurationSeconds = new Histogram({
  name: 'media_ingest_job_duration_seconds',
  help: 'End-to-end duration of a successful media-ingest job (download, transcode, upload, DB update), in seconds',
  buckets: DURATION_BUCKETS_SECONDS,
});

export const mediaIngestJobFailuresTotal = new Counter({
  name: 'media_ingest_job_failures_total',
  help: 'Count of media-ingest jobs that permanently failed after exhausting retries',
});

export const mediaIngestQueueDepth = new Gauge({
  name: 'media_ingest_queue_depth',
  help: 'Current media-ingest job count by state',
  labelNames: ['state'] as const,
});

export { register };
