import { ONE_DAY_MS } from '@network/shared';

export const daysAgo = (days: number): Date =>
  new Date(Date.now() - days * ONE_DAY_MS);
