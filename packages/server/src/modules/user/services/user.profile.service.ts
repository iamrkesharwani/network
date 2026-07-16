import {
  USERNAME_CHANGE_COOLDOWN_DAYS,
  ONE_DAY_MS,
  type IPublicProfile,
  type IUser,
  type BasicProfileInput,
  type PersonalDetailsInput,
  type ContactLinksInput,
} from '@network/shared';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as userRepository from '../user.repository.js';
import { imageProvider } from '../../../core/providers/provider.js';
import type { IUserDocument } from '../user.model.js';

export interface ProfileOwnerContext {
  userId: string;
  isOwner: boolean;
}

const computeIsMinor = (dateOfBirth: Date | undefined): boolean | undefined => {
  if (!dateOfBirth) return undefined;
  const ageMs = Date.now() - dateOfBirth.getTime();
  const ageYears = ageMs / (365.25 * ONE_DAY_MS);
  return ageYears < 18;
};

const toUserResponse = (user: IUserDocument): IUser => {
  const json = user.toJSON() as unknown as IUser;
  const isMinor = computeIsMinor(user.dateOfBirth);
  return {
    ...json,
    ...(isMinor !== undefined && { isMinor }),
  };
};

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

export const updateBasicProfile = async (
  userId: string,
  data: BasicProfileInput
): Promise<IUser> => {
  const current = await userRepository.findById(userId);
  if (!current) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  let usernameChangedAt: Date | undefined;

  if (data.username !== undefined && data.username !== current.username) {
    if (current.usernameChangedAt) {
      const daysSinceChange =
        (Date.now() - current.usernameChangedAt.getTime()) / ONE_DAY_MS;
      const daysRemaining = Math.ceil(
        USERNAME_CHANGE_COOLDOWN_DAYS - daysSinceChange
      );

      if (daysRemaining > 0) {
        throw new ApiError(
          409,
          'CONFLICT',
          `You can change your username again in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}.`
        );
      }
    }
    usernameChangedAt = new Date();
  }

  const updated = await userRepository.updateBasicProfile(userId, {
    ...data,
    ...(usernameChangedAt && { usernameChangedAt }),
  });
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  return toUserResponse(updated);
};

export const updatePersonalDetails = async (
  userId: string,
  data: PersonalDetailsInput
): Promise<IUser> => {
  const updated = await userRepository.updatePersonalDetails(userId, data);
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  return toUserResponse(updated);
};

export const updateContactLinks = async (
  userId: string,
  data: ContactLinksInput
): Promise<IUser> => {
  const updated = await userRepository.updateContactLinks(userId, data);
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  return toUserResponse(updated);
};

export const uploadAvatar = async (
  userId: string,
  buffer: Buffer,
  mimeType: string
): Promise<IUser> => {
  const current = await userRepository.findById(userId);
  if (!current) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  const avatarUrl = await imageProvider.uploadImage(buffer, mimeType);
  const previousAvatarUrl = current.avatarUrl;

  const updated = await userRepository.updateAvatarUrl(userId, avatarUrl);
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  if (previousAvatarUrl) {
    await imageProvider.deleteImage(previousAvatarUrl);
  }

  return toUserResponse(updated);
};
