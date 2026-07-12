import { UNLISTED_CONTENT_TTL_DAYS, ONE_DAY_MS } from '@network/shared';

export const formatDaysLeft = (
  unlistedAt: string | null | undefined
): number | null => {
  if (!unlistedAt) return null;

  const expiresAt =
    new Date(unlistedAt).getTime() + UNLISTED_CONTENT_TTL_DAYS * ONE_DAY_MS;
  const msLeft = expiresAt - Date.now();

  return Math.max(0, Math.ceil(msLeft / ONE_DAY_MS));
};
