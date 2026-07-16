import {
  ONE_DAY_MS,
  CONTENT_RETENTION_DAYS,
  type IUser,
  type DeactivateAccountInput,
  type DeleteAccountInput,
} from '@network/shared';
import { ApiError } from '../../core/utils/ApiError.js';
import { verifyPassword } from '../../core/utils/hash.js';
import { revokeAllRefreshTokensForUser } from '../../core/utils/token.js';
import * as accountRepository from './account.repository.js';
import * as authRepository from '../auth/auth.repository.js';
import { toUserResponse } from '../../core/utils/toUserResponse.js';
import {
  scheduleAutoReactivate,
  cancelAutoReactivate,
} from './account.lifecycle.queue.js';
import {
  scheduleAccountDeletion,
  cancelAccountDeletion,
} from './account.deletion.queue.js';
import type { IUserDocument } from '../user/user.model.js';

export const deactivateAccount = async (
  userId: string,
  data: DeactivateAccountInput
): Promise<IUser> => {
  const deactivatedAt = new Date();
  const reactivateAt = new Date(deactivatedAt.getTime() + data.days * ONE_DAY_MS);

  const updated = await accountRepository.deactivateUser(
    userId,
    deactivatedAt,
    reactivateAt
  );
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  await revokeAllRefreshTokensForUser(userId);
  await scheduleAutoReactivate(userId, data.days * ONE_DAY_MS);

  return toUserResponse(updated);
};

export const reactivateAccount = async (userId: string): Promise<IUser> => {
  const updated = await accountRepository.restoreActiveStatus(userId);
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  await cancelAutoReactivate(userId);

  return toUserResponse(updated);
};

export const requestAccountDeletion = async (
  userId: string,
  data: DeleteAccountInput
): Promise<IUser> => {
  const user = await authRepository.findByIdWithPassword(userId);
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found.');
  if (!user.password) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'Set a password for your account before deleting it.'
    );
  }

  const isValidPassword = await verifyPassword(user.password, data.password);
  if (!isValidPassword) {
    throw new ApiError(400, 'BAD_REQUEST', 'Incorrect password.');
  }

  const deletionRequestedAt = new Date();
  const deletionScheduledAt = new Date(
    deletionRequestedAt.getTime() + CONTENT_RETENTION_DAYS * ONE_DAY_MS
  );

  const updated = await accountRepository.scheduleUserDeletion(
    userId,
    deletionRequestedAt,
    deletionScheduledAt
  );
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  await revokeAllRefreshTokensForUser(userId);
  await scheduleAccountDeletion(
    userId,
    CONTENT_RETENTION_DAYS * ONE_DAY_MS
  );

  return toUserResponse(updated);
};

export const cancelPendingDeletion = async (
  user: IUserDocument
): Promise<IUserDocument> => {
  const restored = await accountRepository.restoreActiveStatus(user.id);
  await cancelAccountDeletion(user.id);
  return restored ?? user;
};
