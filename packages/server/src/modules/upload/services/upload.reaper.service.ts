import { storageProvider } from '../../../providers/provider.js';
import { logger } from '../../../utils/logger.js';
import * as uploadSessionRepository from '../upload.session.repository.js';
import { getMediaAdapter } from '../upload.media.registry.js';

// Cleans up multipart upload sessions that were never completed or aborted
// (browser closed mid-upload, network dropped, etc.): aborts the
// provider-side multipart upload and deletes the orphaned DB placeholder,
// then removes the session bookkeeping from Redis.
export const reapExpiredSessions = async (): Promise<number> => {
  const sessionIds = await uploadSessionRepository.getExpiredSessionIds();
  let reaped = 0;

  for (const sessionId of sessionIds) {
    try {
      const session = await uploadSessionRepository.getSession(sessionId);

      if (!session) {
        await uploadSessionRepository.removeFromIndex(sessionId);
        continue;
      }

      if (session.status === 'active') {
        await storageProvider
          .abortMultipartUpload(session.storageKey, session.providerUploadId)
          .catch((error) =>
            logger.warn(
              error,
              `Reaper: failed to abort provider upload for session ${sessionId}`
            )
          );

        const adapter = getMediaAdapter(session.mediaType);
        await adapter
          .deletePlaceholder(session.mediaId)
          .catch((error) =>
            logger.warn(
              error,
              `Reaper: failed to delete placeholder ${session.mediaId} for session ${sessionId}`
            )
          );
      }

      await uploadSessionRepository.deleteSession(
        session.sessionId,
        session.userId,
        session.fingerprint
      );
      reaped += 1;
    } catch (error) {
      logger.warn(error, `Reaper: failed to reap upload session ${sessionId}`);
    }
  }

  return reaped;
};
