import type {
  PaginatedResponse,
  UpdatePreferencesInput,
} from '@network/shared';
import { User, type IUserDocument } from './user.model.js';
import { hybridSearchPaginate } from '../../core/utils/hybridSearchPaginate.js';

export const findByUsername = (
  username: string
): Promise<IUserDocument | null> =>
  User.findOne({ username: username.toLowerCase() }).exec();

export const searchUsers = (
  q: string,
  cursor: string | null,
  limit: number
): Promise<Omit<PaginatedResponse<IUserDocument>, 'success' | 'message'>> =>
  hybridSearchPaginate(User, q, {}, cursor, limit);

const buildPreferencesSet = (
  data: UpdatePreferencesInput
): Record<string, unknown> => {
  const set: Record<string, unknown> = {};

  if (data.theme !== undefined) set['preferences.theme'] = data.theme;

  if (data.sidebarCollapsed !== undefined) {
    set['preferences.sidebarCollapsed'] = data.sidebarCollapsed;
  }

  if (data.profileViewMode !== undefined) {
    for (const [contentType, mode] of Object.entries(data.profileViewMode)) {
      if (mode !== undefined) {
        set[`preferences.profileViewMode.${contentType}`] = mode;
      }
    }
  }

  return set;
};

export const updatePreferences = (
  userId: string,
  data: UpdatePreferencesInput
): Promise<IUserDocument | null> =>
  User.findByIdAndUpdate(
    userId,
    { $set: buildPreferencesSet(data) },
    { new: true, runValidators: true }
  ).exec();
