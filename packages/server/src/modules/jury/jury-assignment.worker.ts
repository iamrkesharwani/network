import { Worker, type Job } from 'bullmq';
import { JURY_QUEUE_NAME } from '@network/shared';
import { attachWorkerErrorBackoff, bullMqConnection } from '../../core/config/bullmq.js';
import { logger } from '../../core/utils/logger.js';
import { getModerationContentAdapter } from '../../core/moderation/moderationContent.registry.js';
import { selectJuryPool } from './services/jury.eligibility.service.js';
import * as juryCaseRepository from './repository/jury-case.repository.js';
import * as juryAssignmentRepository from './repository/jury-assignment.repository.js';
import * as reportRepository from '../report/report.repository.js';
import type { JuryAssignmentJobData } from './jury-assignment.queue.js';
import { queueNotification } from '../notification/notification.queue.js';

const processAssignmentJob = async (
  job: Job<JuryAssignmentJobData>
): Promise<void> => {
  const { caseId, seniorOnly } = job.data;

  const juryCase = await juryCaseRepository.findById(caseId);
  if (!juryCase || juryCase.status !== 'open') {
    logger.warn(`Jury assignment: case ${caseId} not open, skipping`);
    return;
  }

  const contentId = juryCase.contentId.toString();
  const adapter = getModerationContentAdapter(juryCase.contentType);
  const lookup = adapter ? await adapter.lookup(contentId) : null;

  const excludeUserIds = new Set<string>();
  if (lookup?.ownerId) excludeUserIds.add(lookup.ownerId);

  const reporterIds = await reportRepository.findReporterIdsForContent(
    juryCase.contentType,
    contentId
  );
  reporterIds.forEach((id) => excludeUserIds.add(id));

  const jurorIds = await selectJuryPool(
    juryCase.poolSize,
    [...excludeUserIds],
    { seniorOnly }
  );

  if (jurorIds.length === 0) {
    throw new Error(`No eligible jurors available for case ${caseId}`);
  }

  await juryAssignmentRepository.createMany(caseId, jurorIds);
  await juryCaseRepository.markDeciding(caseId);

  for (const jurorId of jurorIds) {
    await queueNotification({
      type: 'jury_case_assigned',
      recipientId: jurorId,
      targetType: 'juryCase',
      targetId: caseId,
    });
  }

  logger.info(
    `Jury assignment: case ${caseId} assigned to ${jurorIds.length} juror(s)`
  );
};

export const startJuryAssignmentWorker = (): Worker<JuryAssignmentJobData> => {
  const worker = new Worker<JuryAssignmentJobData>(
    JURY_QUEUE_NAME,
    processAssignmentJob,
    {
      connection: bullMqConnection,
      concurrency: 5,
    }
  );

  worker.on('failed', (job, error) => {
    logger.error(
      error,
      `Jury assignment job failed: caseId=${job?.data.caseId} attempt=${job?.attemptsMade}`
    );
  });

  attachWorkerErrorBackoff(worker, 'Jury assignment');

  logger.info('Jury assignment worker started');
  return worker;
};
