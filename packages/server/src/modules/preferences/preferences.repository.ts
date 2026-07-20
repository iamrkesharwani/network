import type { PreferencesPatchInput } from '@network/shared';
import { Preferences, type IPreferencesDocument } from './preferences.model.js';

export const findByUserId = (
  userId: string
): Promise<IPreferencesDocument | null> =>
  Preferences.findOne({ userId }).exec();

const buildPreferencesSet = (
  data: PreferencesPatchInput
): Record<string, unknown> => {
  const set: Record<string, unknown> = {};

  if (data.appearance) {
    for (const [key, value] of Object.entries(data.appearance)) {
      if (value !== undefined) set[`appearance.${key}`] = value;
    }
  }

  if (data.layout?.profileViewMode) {
    for (const [contentType, mode] of Object.entries(
      data.layout.profileViewMode
    )) {
      if (mode !== undefined) {
        set[`layout.profileViewMode.${contentType}`] = mode;
      }
    }
  }

  if (data.layout?.shortsCommentsOpen !== undefined) {
    set['layout.shortsCommentsOpen'] = data.layout.shortsCommentsOpen;
  }

  if (data.playback) {
    for (const [key, value] of Object.entries(data.playback)) {
      if (value !== undefined) set[`playback.${key}`] = value;
    }
  }

  if (data.notifications) {
    for (const channel of ['push', 'email'] as const) {
      const categories = data.notifications[channel];
      if (!categories) continue;
      for (const [category, enabled] of Object.entries(categories)) {
        if (enabled !== undefined) {
          set[`notifications.${channel}.${category}`] = enabled;
        }
      }
    }
  }

  return set;
};

export const patchPreferences = (
  userId: string,
  data: PreferencesPatchInput
): Promise<IPreferencesDocument | null> =>
  Preferences.findOneAndUpdate(
    { userId },
    {
      $set: buildPreferencesSet(data),
      $inc: { version: 1 },
    },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).exec();
