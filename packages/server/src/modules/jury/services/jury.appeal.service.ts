import { ApiError } from '../../../core/utils/ApiError.js';
import { getModerationContentAdapter } from '../../../core/moderation/moderationContent.registry.js';
import * as juryCaseRepository from '../repository/jury-case.repository.js';
import * as juryAppealRepository from '../repository/jury-appeal.repository.js';
import { enqueueJuryAssignment } from '../jury-assignment.queue.js';
import type { IJuryAppealDocument } from '../models/jury-appeal.model.js';
import { getOwnerId } from '../../../core/utils/getOwnerId.js';
import { queueNotification } from '../../notification/notification.queue.js';

export const createAppeal = async (
  caseId: string,
  requesterId: string,
  reason: string
): Promise<IJuryAppealDocument> => {
  const originalCase = await juryCaseRepository.findById(caseId);
  if (!originalCase) {
    throw new ApiError(404, 'NOT_FOUND', 'Jury case not found.');
  }

  if (
    originalCase.status !== 'resolved' ||
    originalCase.verdict !== 'uphold_removal'
  ) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'Only a resolved removal verdict can be appealed.'
    );
  }

  const adapter = getModerationContentAdapter(originalCase.contentType);
  const lookup = adapter
    ? await adapter.lookup(originalCase.contentId.toString())
    : null;

  if (!lookup?.exists || lookup.ownerId !== requesterId) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'Only the content owner can appeal this case.'
    );
  }

  const existingAppeal = await juryAppealRepository.findByCaseId(caseId);
  if (existingAppeal) {
    throw new ApiError(
      409,
      'CONFLICT',
      'This case has already been appealed.'
    );
  }

  const appealCase = await juryCaseRepository.createCase(
    originalCase.contentType,
    originalCase.contentId.toString(),
    originalCase.reasonCode,
    { isAppeal: true, appealOfCaseId: caseId }
  );

  const appeal = await juryAppealRepository.create(
    caseId,
    appealCase._id.toString(),
    requesterId,
    reason
  );

  await juryCaseRepository.markAppealed(caseId);

  await enqueueJuryAssignment({
    caseId: appealCase._id.toString(),
    seniorOnly: true,
  });

  return appeal;
};

export const resolveAppealProcedurally = async (
  appealId: string,
  adminId: string,
  action: 'uphold' | 'overturn',
  note?: string
): Promise<IJuryAppealDocument> => {
  const appeal = await juryAppealRepository.findById(appealId);
  if (!appeal) {
    throw new ApiError(404, 'NOT_FOUND', 'Appeal not found.');
  }

  if (appeal.status !== 'pending') {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'This appeal has already been resolved.'
    );
  }

  const status = action === 'uphold' ? 'upheld' : 'overturned';

  const resolved = await juryAppealRepository.resolve(
    appealId,
    status,
    adminId,
    note
  );
  if (!resolved) {
    throw new ApiError(
      409,
      'CONFLICT',
      'This appeal has already been resolved.'
    );
  }

  const appealCase = await juryCaseRepository.findById(
    appeal.appealCaseId.toString()
  );
  if (
    appealCase &&
    (appealCase.status === 'open' || appealCase.status === 'deciding')
  ) {
    await juryCaseRepository.finalize(
      appeal.appealCaseId.toString(),
      status === 'overturned' ? 'no_action' : 'uphold_removal'
    );
  }

  if (status === 'overturned') {
    const original = await juryCaseRepository.findById(
      appeal.caseId.toString()
    );
    if (original) {
      const adapter = getModerationContentAdapter(original.contentType);
      await adapter?.setModerationStatus(
        original.contentId.toString(),
        'active'
      );
    }
  }

  await queueNotification({
    type: status === 'upheld' ? 'appeal_upheld' : 'appeal_overturned',
    recipientId: getOwnerId(appeal.requesterId),
    targetType: 'appeal',
    targetId: appeal._id.toString(),
  });

  return resolved;
};
