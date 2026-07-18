import {
  USERNAME_CHANGE_COOLDOWN_DAYS,
  ONE_DAY_MS,
  ONE_HOUR_MS,
} from '@network/shared';

export interface UsernameCooldownStatus {
  isInCooldown: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  nextEligibleDate: Date | null;
}

export const useUsernameCooldown = (
  usernameChangedAt: Date | string | null | undefined
): UsernameCooldownStatus => {
  if (!usernameChangedAt) {
    return {
      isInCooldown: false,
      daysRemaining: 0,
      hoursRemaining: 0,
      nextEligibleDate: null,
    };
  }

  const changedAt = new Date(usernameChangedAt);
  const nextEligibleDate = new Date(
    changedAt.getTime() + USERNAME_CHANGE_COOLDOWN_DAYS * ONE_DAY_MS
  );
  const msRemaining = nextEligibleDate.getTime() - Date.now();
  const totalHoursRemaining = Math.max(0, Math.ceil(msRemaining / ONE_HOUR_MS));

  return {
    isInCooldown: msRemaining > 0,
    daysRemaining: Math.floor(totalHoursRemaining / 24),
    hoursRemaining: totalHoursRemaining % 24,
    nextEligibleDate,
  };
};
