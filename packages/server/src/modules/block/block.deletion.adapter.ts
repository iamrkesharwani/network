import type { AccountDeletionAdapter } from '../account/account.deletion.types.js';
import * as blockRepository from './block.repository.js';

export const blockDeletionAdapter: AccountDeletionAdapter = {
  contentType: 'block',
  deleteAllForUser: blockRepository.deleteAllByUserId,
};
