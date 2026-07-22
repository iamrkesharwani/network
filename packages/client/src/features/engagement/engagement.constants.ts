export const OPTIMISTIC_COMMENT_ID_PREFIX = 'optimistic-';

export const isOptimisticCommentId = (id: string): boolean =>
  id.startsWith(OPTIMISTIC_COMMENT_ID_PREFIX);
