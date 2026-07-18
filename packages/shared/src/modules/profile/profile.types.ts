import type { ContentVisibility } from '../general/types/general.types.js';

export type VisibilityFilterValue = ContentVisibility | 'all';
export type ProfileTab =
  | 'videos'
  | 'shorts'
  | 'posts'
  | 'stats'
  | 'history'
  | 'jury'
  | 'settings';
