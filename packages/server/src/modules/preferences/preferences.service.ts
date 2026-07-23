import type {
  IPreferences,
  IPreferencesPrivacy,
  PreferencesPatchInput,
} from '@network/shared';
import { PREFERENCES_DEFAULT_PRIVACY } from '@network/shared';
import * as preferencesRepository from './preferences.repository.js';

export type ResolvedPrivacy = Required<IPreferencesPrivacy>;

const emptyPreferences = (userId: string): IPreferences => ({
  userId,
  version: 0,
  updatedAt: null,
  appearance: {},
  layout: {},
  playback: {},
  notifications: {},
  privacy: {},
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

export const getResolvedPrivacyByUserIds = async (
  userIds: string[]
): Promise<Map<string, ResolvedPrivacy>> => {
  if (userIds.length === 0) return new Map();

  const docs = await preferencesRepository.findManyByUserIds(userIds);
  const storedByUserId = new Map(
    docs.map((doc) => [doc.userId.toString(), doc.privacy])
  );

  return new Map(
    userIds.map((userId) => [
      userId,
      {
        ...PREFERENCES_DEFAULT_PRIVACY,
        ...storedByUserId.get(userId),
      } as ResolvedPrivacy,
    ])
  );
};
