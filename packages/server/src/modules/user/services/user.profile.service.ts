import sharp from 'sharp';
import {
  USERNAME_CHANGE_COOLDOWN_DAYS,
  ONE_DAY_MS,
  BANNER_WIDTH_PX,
  BANNER_HEIGHT_PX,
  BANNER_PRESET_CATALOG,
  type IPublicProfile,
  type IUser,
  type FollowState,
  type BasicProfileInput,
  type PersonalDetailsInput,
  type ContactLinksInput,
  type AccountPrivacyInput,
} from '@network/shared';
import { ApiError } from '../../../core/utils/ApiError.js';
import * as userRepository from '../user.repository.js';
import * as followRepository from '../../follow/follow.repository.js';
import * as followCrudService from '../../follow/services/follow.crud.service.js';
import * as followRequestService from '../../follow/services/followRequest.service.js';
import * as blockService from '../../block/services/block.service.js';
import { imageProvider } from '../../../core/providers/provider.js';
import type { IUserDocument } from '../user.model.js';
import { toUserResponse as toBaseUserResponse } from '../../../core/utils/toUserResponse.js';

export interface ProfileAccessContext {
  userId: string;
  isOwner: boolean;
  isPrivate: boolean;
  hasAccess: boolean;
}

export interface ContentOwnerAccess {
  blocked: boolean;
  isPrivate: boolean;
  hasAccess: boolean;
}

const computeIsMinor = (dateOfBirth: Date | undefined): boolean | undefined => {
  if (!dateOfBirth) return undefined;
  const ageMs = Date.now() - dateOfBirth.getTime();
  const ageYears = ageMs / (365.25 * ONE_DAY_MS);
  return ageYears < 18;
};

const toUserResponse = (user: IUserDocument): IUser => {
  const base = toBaseUserResponse(user);
  const isMinor = computeIsMinor(user.dateOfBirth);
  return {
    ...base,
    ...(isMinor !== undefined && { isMinor }),
  };
};

export const resolveProfileAccess = async (
  username: string,
  requesterId: string | undefined
): Promise<ProfileAccessContext> => {
  const user = await userRepository.findByUsername(username);
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  const userId = user._id.toString();
  const isOwner = requesterId === userId;

  if (!isOwner && requesterId) {
    const blocked = await blockService.isBlocked(requesterId, userId);
    if (blocked) throw new ApiError(404, 'NOT_FOUND', 'User not found.');
  }

  if (isOwner || !user.isPrivate) {
    return { userId, isOwner, isPrivate: user.isPrivate, hasAccess: true };
  }

  const followState = requesterId
    ? (await followCrudService.getFollowStatesBatch(requesterId, [userId])).get(
        userId
      )
    : 'none';

  return {
    userId,
    isOwner,
    isPrivate: true,
    hasAccess: followState === 'accepted',
  };
};

export const getContentOwnerAccess = async (
  ownerId: string,
  viewerId: string | undefined
): Promise<ContentOwnerAccess> => {
  if (!viewerId || viewerId === ownerId) {
    return { blocked: false, isPrivate: false, hasAccess: true };
  }

  const blocked = await blockService.isBlocked(viewerId, ownerId);
  if (blocked) {
    return { blocked: true, isPrivate: false, hasAccess: false };
  }

  const owner = await userRepository.findById(ownerId);
  if (!owner || !owner.isPrivate) {
    return { blocked: false, isPrivate: false, hasAccess: true };
  }

  const followState = (
    await followCrudService.getFollowStatesBatch(viewerId, [ownerId])
  ).get(ownerId);

  return {
    blocked: false,
    isPrivate: true,
    hasAccess: followState === 'accepted',
  };
};

const toPublicProfile = (
  user: IUserDocument,
  followerCount: number,
  followingCount: number,
  followState?: FollowState
): IPublicProfile => ({
  id: user._id.toString(),
  username: user.username,
  name: user.name,
  ...(user.bio && { bio: user.bio }),
  ...(user.avatarUrl && { avatarUrl: user.avatarUrl }),
  ...(user.bannerUrl && { bannerUrl: user.bannerUrl }),
  followerCount,
  followingCount,
  isPrivate: user.isPrivate,
  ...(followState !== undefined && { followState }),
});

export const getPublicProfile = async (
  username: string,
  viewerId?: string
): Promise<IPublicProfile> => {
  const user = await userRepository.findByUsername(username);
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  const userId = user._id.toString();
  const [followerCount, followingCount, followState] = await Promise.all([
    followRepository.countByFollowee(userId),
    followRepository.countByFollower(userId),
    viewerId
      ? followCrudService
          .getFollowStatesBatch(viewerId, [userId])
          .then((states) => states.get(userId))
      : Promise.resolve(undefined),
  ]);

  return toPublicProfile(user, followerCount, followingCount, followState);
};

export const getPublicProfiles = async (
  users: IUserDocument[],
  viewerId?: string
): Promise<IPublicProfile[]> => {
  if (users.length === 0) return [];

  const userIds = users.map((user) => user._id.toString());
  const [followerCounts, followingCounts, followStates] = await Promise.all([
    followRepository.countByFolloweeMany(userIds),
    followRepository.countByFollowerMany(userIds),
    viewerId
      ? followCrudService.getFollowStatesBatch(viewerId, userIds)
      : Promise.resolve(undefined),
  ]);

  return users.map((user) => {
    const userId = user._id.toString();
    return toPublicProfile(
      user,
      followerCounts.get(userId) ?? 0,
      followingCounts.get(userId) ?? 0,
      followStates?.get(userId)
    );
  });
};

export const updateAccountPrivacy = async (
  userId: string,
  data: AccountPrivacyInput
): Promise<IUser> => {
  const updated = await userRepository.updateIsPrivate(userId, data.isPrivate);
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  if (!data.isPrivate) {
    await followRequestService.convertPendingRequestsToFollows(userId);
  }

  return toUserResponse(updated);
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

const isPresetBannerUrl = (url: string): boolean =>
  BANNER_PRESET_CATALOG.some((preset) => preset.url === url);

const deletePreviousBannerIfCustom = async (
  previousBannerUrl: string | undefined
): Promise<void> => {
  if (previousBannerUrl && !isPresetBannerUrl(previousBannerUrl)) {
    await imageProvider.deleteImage(previousBannerUrl);
  }
};

export const uploadBanner = async (
  userId: string,
  buffer: Buffer,
  mimeType: string
): Promise<IUser> => {
  const current = await userRepository.findById(userId);
  if (!current) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  const { width, height } = await sharp(buffer).metadata();
  if (width !== BANNER_WIDTH_PX || height !== BANNER_HEIGHT_PX) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `Banner image must be exactly ${BANNER_WIDTH_PX}x${BANNER_HEIGHT_PX}px.`
    );
  }

  const bannerUrl = await imageProvider.uploadImage(buffer, mimeType);
  const previousBannerUrl = current.bannerUrl;

  const updated = await userRepository.updateBannerUrl(userId, bannerUrl);
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  await deletePreviousBannerIfCustom(previousBannerUrl);

  return toUserResponse(updated);
};

export const selectBannerPreset = async (
  userId: string,
  presetId: string
): Promise<IUser> => {
  const preset = BANNER_PRESET_CATALOG.find((entry) => entry.id === presetId);
  if (!preset) {
    throw new ApiError(404, 'NOT_FOUND', 'Banner preset not found.');
  }

  const current = await userRepository.findById(userId);
  if (!current) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  const previousBannerUrl = current.bannerUrl;

  const updated = await userRepository.updateBannerUrl(userId, preset.url);
  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'User not found.');

  await deletePreviousBannerIfCustom(previousBannerUrl);

  return toUserResponse(updated);
};
