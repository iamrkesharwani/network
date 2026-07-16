import { USERNAME_CHANGE_COOLDOWN_DAYS, ONE_DAY_MS } from '@network/shared';

export interface UsernameCooldownStatus {
  isInCooldown: boolean;
  daysRemaining: number;
  nextEligibleDate: Date | null;
}

export const useUsernameCooldown = (
  usernameChangedAt: Date | string | null | undefined
): UsernameCooldownStatus => {
  if (!usernameChangedAt) {
    return { isInCooldown: false, daysRemaining: 0, nextEligibleDate: null };
  }

  const changedAt = new Date(usernameChangedAt);
  const nextEligibleDate = new Date(
    changedAt.getTime() + USERNAME_CHANGE_COOLDOWN_DAYS * ONE_DAY_MS
  );
  const daysRemaining = Math.ceil(
    (nextEligibleDate.getTime() - Date.now()) / ONE_DAY_MS
  );

  return {
    isInCooldown: daysRemaining > 0,
    daysRemaining: Math.max(0, daysRemaining),
    nextEligibleDate,
  };
};
