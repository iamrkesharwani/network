export const buildVisibilityFields = (
  visibility: 'public' | 'unlisted' | undefined
): {
  visibility?: 'public' | 'unlisted';
  unlistedAt?: Date | null;
  unlistedExpiryWarnedAt?: Date | null;
} => {
  if (visibility === undefined) return {};

  return {
    visibility,
    unlistedAt: visibility === 'unlisted' ? new Date() : null,
    unlistedExpiryWarnedAt: null,
  };
};
