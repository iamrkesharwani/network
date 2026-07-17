export const RELATED_FEED_PAGE_SIZE = 12;
export const UP_NEXT_RAIL_SIZE = 10;
export const SUGGESTIONS_VIDEO_ROWS_PER_SHORT_ROW = 2;

export const RELATED_SCORE_WEIGHTS = {
  categoryMatch: 5,
  tagOverlap: 2,
  recency: 3,
  views: 1,
  likes: 1.5,
} as const;
