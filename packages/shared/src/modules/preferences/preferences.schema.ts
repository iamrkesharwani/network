import { z } from 'zod';
import { THEMES, VIEW_MODES } from '../general/constants/general.constants.js';
import { CAPTION_LANGUAGE_CODES } from '../caption/caption.constants.js';
import { PREFERENCES_NOTIFICATION_CATEGORIES } from './preferences.constants.js';
import type { PreferencesNotificationCategory } from './preferences.types.js';

const appearancePatchSchema = z.object({
  theme: z.enum(THEMES).optional(),
  sidebarCollapsed: z.boolean().optional(),
});

const profileViewModePatchSchema = z.object({
  video: z.enum(VIEW_MODES).optional(),
  short: z.enum(VIEW_MODES).optional(),
  post: z.enum(VIEW_MODES).optional(),
});

const layoutPatchSchema = z.object({
  profileViewMode: profileViewModePatchSchema.optional(),
  shortsCommentsOpen: z.boolean().optional(),
});

const playbackPatchSchema = z.object({
  volume: z.number().min(0).max(1).optional(),
  muted: z.boolean().optional(),
  playbackRate: z.number().positive().optional(),
  autoplayNext: z.boolean().optional(),
  captionsDefaultOn: z.boolean().optional(),
  captionsLanguage: z.enum(CAPTION_LANGUAGE_CODES).optional(),
});

const notificationChannelShape = Object.fromEntries(
  PREFERENCES_NOTIFICATION_CATEGORIES.map((category) => [
    category,
    z.boolean().optional(),
  ])
) as unknown as Record<
  PreferencesNotificationCategory,
  z.ZodOptional<z.ZodBoolean>
>;

const notificationChannelPatchSchema = z.object(notificationChannelShape);

const notificationsPatchSchema = z.object({
  push: notificationChannelPatchSchema.optional(),
  email: notificationChannelPatchSchema.optional(),
});

export const preferencesPatchSchema = z.object({
  appearance: appearancePatchSchema.optional(),
  layout: layoutPatchSchema.optional(),
  playback: playbackPatchSchema.optional(),
  notifications: notificationsPatchSchema.optional(),
});
