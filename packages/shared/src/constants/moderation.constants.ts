export const MODERATION_STATUS = [
  'active',
  'jury_removed',
  'admin_removed',
] as const;
export type ModerationStatus = (typeof MODERATION_STATUS)[number];
