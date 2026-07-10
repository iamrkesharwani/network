import type { IPublicProfile } from '@network/shared';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as userRepository from '../user.repository.js';

export interface ProfileOwnerContext {
  userId: string;
  isOwner: boolean;
}

export const resolveProfileOwner = async (
  username: string,
  requesterId: string | undefined
): Promise<ProfileOwnerContext> => {
  const user = await userRepository.findByUsername(username);
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  const userId = user._id.toString();
  return { userId, isOwner: requesterId === userId };
};

export const getPublicProfile = async (
  username: string
): Promise<IPublicProfile> => {
  const user = await userRepository.findByUsername(username);
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  return {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    ...(user.bio && { bio: user.bio }),
    ...(user.avatarUrl && { avatarUrl: user.avatarUrl }),
  };
};
