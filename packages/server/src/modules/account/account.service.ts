import { ONE_DAY_MS, type IUser, type DeactivateAccountInput } from '@network/shared';
import { ApiError } from '../../core/utils/ApiError.js';
import { revokeAllRefreshTokensForUser } from '../../core/utils/token.js';
import * as accountRepository from './account.repository.js';
import {
  scheduleAutoReactivate,
  cancelAutoReactivate,
} from './account.lifecycle.queue.js';

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

  return updated.toJSON() as unknown as IUser;
};

export const reactivateAccount = async (userId: string): Promise<IUser> => {
  const updated = await accountRepository.reactivateUser(userId);
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  await cancelAutoReactivate(userId);

  return updated.toJSON() as unknown as IUser;
};
