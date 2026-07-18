import {
  CONTENT_VISIBILITY,
  PROCESS_ROLES,
  THEMES,
  VIEW_MODES,
} from '../constants/general.constants.js';

export type ViewMode = (typeof VIEW_MODES)[number];
export type Theme = (typeof THEMES)[number];
export type ProcessRole = (typeof PROCESS_ROLES)[number];
export type ContentVisibility = (typeof CONTENT_VISIBILITY)[number];
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';
