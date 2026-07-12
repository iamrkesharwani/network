import type { IUserPreferences, UpdatePreferencesInput } from '@network/shared';
import * as userRepository from '../user.repository.js';
import { ApiError } from '../../../core/utils/ApiError.js';

export const updatePreferences = async (
  userId: string,
  data: UpdatePreferencesInput
): Promise<IUserPreferences> => {
  const updated = await userRepository.updatePreferences(userId, data);
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found.');
  return updated.preferences ?? {};
};
