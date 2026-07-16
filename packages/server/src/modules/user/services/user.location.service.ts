import type { IUser, CaptureLocationInput } from '@network/shared';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as userRepository from '../user.repository.js';

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

  return updated.toJSON() as unknown as IUser;
};
