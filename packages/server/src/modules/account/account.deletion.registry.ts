import type { AccountDeletionAdapter } from './account.deletion.types.js';

const adapters: AccountDeletionAdapter[] = [];

export const registerAccountDeletionAdapter = (
  adapter: AccountDeletionAdapter
): void => {
  adapters.push(adapter);
};

export const getAccountDeletionAdapters = (): AccountDeletionAdapter[] =>
  adapters;
