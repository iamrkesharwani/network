export const CONTENT_VISIBILITY = ['public', 'unlisted'] as const;
export type ContentVisibility = (typeof CONTENT_VISIBILITY)[number];
