import { Queue } from 'bullmq';
import { JURY_QUEUE_NAME, JURY_JOB_ID_PREFIX } from '@network/shared';
import { bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';

export interface JuryAssignmentJobData {
  caseId: string;
  seniorOnly: boolean;
}

export const juryAssignmentQueue = new Queue<JuryAssignmentJobData>(
  JURY_QUEUE_NAME,
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

export const enqueueJuryAssignment = async (
  data: JuryAssignmentJobData
): Promise<void> => {
  try {
    await juryAssignmentQueue.add('assign', data, {
      jobId: `${JURY_JOB_ID_PREFIX}-${data.caseId}`,
    });
    logger.info(`Jury assignment job enqueued: caseId=${data.caseId}`);
  } catch (error) {
    logger.error(
      error,
      `Failed to enqueue jury assignment job: caseId=${data.caseId}`
    );
    throw error;
  }
};
