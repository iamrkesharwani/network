import {
  CONTENT_VISIBILITY,
  PROCESS_ROLES,
  THEMES,
  VIEW_MODES,
} from './general.constants.js';

export type ViewMode = (typeof VIEW_MODES)[number];
export type Theme = (typeof THEMES)[number];
export type ProcessRole = (typeof PROCESS_ROLES)[number];
export type ContentVisibility = (typeof CONTENT_VISIBILITY)[number];
