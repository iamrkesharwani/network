import type { AccountDeletionAdapter } from '../account/account.deletion.types.js';
import * as followRepository from './follow.repository.js';

export const followDeletionAdapter: AccountDeletionAdapter = {
  contentType: 'follow',
  deleteAllForUser: followRepository.deleteAllByUserId,
};
