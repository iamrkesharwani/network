import type { IPreferences, PreferencesPatchInput } from '@network/shared';
import * as preferencesRepository from './preferences.repository.js';

const emptyPreferences = (userId: string): IPreferences => ({
  userId,
  version: 0,
  updatedAt: null,
  appearance: {},
  layout: {},
  playback: {},
  notifications: {},
});

export const getPreferences = async (userId: string): Promise<IPreferences> => {
  const doc = await preferencesRepository.findByUserId(userId);
  return doc ? (doc.toJSON() as unknown as IPreferences) : emptyPreferences(userId);
};

export const updatePreferences = async (
  userId: string,
  data: PreferencesPatchInput
): Promise<IPreferences> => {
  const doc = await preferencesRepository.patchPreferences(userId, data);
  return doc as unknown as IPreferences;
};
