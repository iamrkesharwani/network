import type { AccountDeletionAdapter } from '../account/account.deletion.types.js';
import * as followRepository from './follow.repository.js';
import * as followRequestRepository from './followRequest.repository.js';

export const followDeletionAdapter: AccountDeletionAdapter = {
  contentType: 'follow',
  deleteAllForUser: followRepository.deleteAllByUserId,
};

export const followRequestDeletionAdapter: AccountDeletionAdapter = {
  contentType: 'followRequest',
  deleteAllForUser: followRequestRepository.deleteAllByUserId,
};
