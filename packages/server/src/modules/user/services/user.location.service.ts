import type { IUser, CaptureLocationInput } from '@network/shared';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as userRepository from '../user.repository.js';
import { toUserResponse } from '../../../core/utils/toUserResponse.js';

export const captureLocation = async (
  userId: string,
  data: CaptureLocationInput
): Promise<IUser> => {
  const updated = await userRepository.appendLocationEntry(userId, {
    lat: data.lat,
    lng: data.lng,
    capturedAt: new Date(),
  });
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  return toUserResponse(updated);
};
