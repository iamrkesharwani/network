import 'dotenv/config';
import { createServer } from 'node:http';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDb } from './core/config/db.js';
import {
  initRedis,
  redisClient,
  pubClient,
  subClient,
} from './core/config/redis.js';
import { initSocket } from './core/config/socket.js';
import { initTypesense } from './core/config/typesense.js';
import { logger } from './core/utils/logger.js';
import { env } from './core/env/env.js';
import { startEmailWorker } from './modules/email/email.js';
import { startUploadReaperWorker } from './modules/upload/upload.reaper.worker.js';
import { scheduleUploadSessionReaper } from './modules/upload/upload.reaper.queue.js';
import { registerContentReaperAdapter } from './core/reaper/contentReaper.registry.js';
import { startContentReaperWorker } from './core/reaper/contentReaper.worker.js';
import { scheduleContentReaper } from './core/reaper/contentReaper.queue.js';
import { videoReaperAdapter } from './modules/video/services/video.reaper.service.js';
import { shortReaperAdapter } from './modules/short/services/short.reaper.service.js';
import { postReaperAdapter } from './modules/post/services/post.reaper.service.js';
import { startHistoryFlushWorker } from './modules/history/history.flush.worker.js';
import { scheduleHistoryFlush } from './modules/history/history.flush.queue.js';
import { registerModerationContentAdapter } from './core/moderation/moderationContent.registry.js';
import { videoModerationAdapter } from './modules/video/services/video.moderation.adapter.js';
import { shortModerationAdapter } from './modules/short/services/short.moderation.adapter.js';
import { postModerationAdapter } from './modules/post/services/post.moderation.adapter.js';
import { commentModerationAdapter } from './modules/comment/services/comment.moderation.adapter.js';
import { registerContentCounterAdapter } from './core/contentRef/contentCounter.registry.js';
import { videoCounterAdapter } from './modules/video/services/video.counter.adapter.js';
import { shortCounterAdapter } from './modules/short/services/short.counter.adapter.js';
import { postCounterAdapter } from './modules/post/services/post.counter.adapter.js';
import { commentCounterAdapter } from './modules/comment/services/comment.counter.adapter.js';
import { startTrustDecayWorker } from './core/trust/trustDecay.worker.js';
import { scheduleTrustDecay } from './core/trust/trustDecay.queue.js';
import { registerJuryCaseTrigger } from './modules/report/report.hooks.js';
import { openCaseFromReport } from './modules/jury/services/jury.case.service.js';
import { startJuryAssignmentWorker } from './modules/jury/jury-assignment.worker.js';
import { startJuryTimeoutWorker } from './modules/jury/jury-timeout.worker.js';
import { scheduleJuryTimeoutSweep } from './modules/jury/jury-timeout.queue.js';
import { startAccountLifecycleWorker } from './modules/account/account.lifecycle.worker.js';
import { registerAccountDeletionAdapter } from './modules/account/account.deletion.registry.js';
import { startAccountDeletionWorker } from './modules/account/account.deletion.worker.js';
import { videoDeletionAdapter } from './modules/video/services/video.deletion.service.js';
import { shortDeletionAdapter } from './modules/short/services/short.deletion.service.js';
import { postDeletionAdapter } from './modules/post/services/post.deletion.service.js';
import { followDeletionAdapter } from './modules/follow/follow.deletion.adapter.js';

const port = env.PORT;
const httpServer = createServer(app);

const startWeb = async () => {
  try {
    await connectDb();
    await initRedis();
    await initTypesense();
    initSocket(httpServer);
    startEmailWorker();
    startUploadReaperWorker();
    await scheduleUploadSessionReaper();

    registerContentReaperAdapter(videoReaperAdapter);
    registerContentReaperAdapter(shortReaperAdapter);
    registerContentReaperAdapter(postReaperAdapter);
    startContentReaperWorker();
    await scheduleContentReaper();

    startHistoryFlushWorker();
    await scheduleHistoryFlush();

    registerModerationContentAdapter(videoModerationAdapter);
    registerModerationContentAdapter(shortModerationAdapter);
    registerModerationContentAdapter(postModerationAdapter);
    registerModerationContentAdapter(commentModerationAdapter);

    registerContentCounterAdapter(videoCounterAdapter);
    registerContentCounterAdapter(shortCounterAdapter);
    registerContentCounterAdapter(postCounterAdapter);
    registerContentCounterAdapter(commentCounterAdapter);

    startTrustDecayWorker();
    await scheduleTrustDecay();

    registerJuryCaseTrigger(openCaseFromReport);
    startJuryAssignmentWorker();
    startJuryTimeoutWorker();
    await scheduleJuryTimeoutSweep();

    startAccountLifecycleWorker();

    registerAccountDeletionAdapter(videoDeletionAdapter);
    registerAccountDeletionAdapter(shortDeletionAdapter);
    registerAccountDeletionAdapter(postDeletionAdapter);
    registerAccountDeletionAdapter(followDeletionAdapter);
    startAccountDeletionWorker();

    httpServer.listen(port, '0.0.0.0', () => {
      logger.info(`Web server listening on port ${port}`);
      logger.info(
        `Providers:
        storage: ${env.STORAGE_PROVIDER}
        video: ${env.VIDEO_PROVIDER}
        image: ${env.IMAGE_PROVIDER}`
      );
    });
  } catch (error) {
    logger.error(error, 'Failed to initialize web process startup');
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  logger.warn(`Received ${signal}. Starting graceful shutdown sequence...`);

  httpServer.close(async (err) => {
    if (err) {
      logger.error(err, 'Error occurred while closing HTTP server');
      process.exit(1);
    }

    logger.info('HTTP server closed cleanly. Terminating all connections...');

    try {
      await Promise.all([
        mongoose.disconnect(),
        redisClient.quit(),
        pubClient.quit(),
        subClient.quit(),
      ]);
      logger.info('All connections closed successfully.');
      process.exit(0);
    } catch (shutdownError) {
      logger.error(shutdownError, 'Error during connection teardown');
      process.exit(1);
    }
  });

  const FORCE_SHUTDOWN_TIME = 10000;
  setTimeout(() => {
    logger.error(
      'Forced shutdown invoked due to operational execution timeout.'
    );
    process.exit(1);
  }, FORCE_SHUTDOWN_TIME);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startWeb();
