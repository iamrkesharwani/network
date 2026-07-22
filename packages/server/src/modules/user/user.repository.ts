import type {
  PaginatedResponse,
  BasicProfileInput,
  PersonalDetailsInput,
  ContactLinksInput,
  IUserLocationEntry,
} from '@network/shared';
import { LOCATION_TRAIL_MAX_ENTRIES } from '@network/shared';
import { User, type IUserDocument } from './user.model.js';
import { hybridSearchPaginate } from '../../core/utils/hybridSearchPaginate.js';

export const findById = (userId: string): Promise<IUserDocument | null> =>
  User.findById(userId).exec();

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

export const findByIds = (ids: string[]): Promise<IUserDocument[]> =>
  User.find({ _id: { $in: ids } }).exec();

export const findActiveByUsernames = (
  usernames: string[]
): Promise<IUserDocument[]> =>
  User.find({
    username: { $in: usernames },
    status: 'active',
  }).exec();

export const updateBasicProfile = (
  userId: string,
  data: BasicProfileInput & { usernameChangedAt?: Date }
): Promise<IUserDocument | null> => {
  const set: Record<string, unknown> = {};
  if (data.name !== undefined) set['name'] = data.name;
  if (data.bio !== undefined) set['bio'] = data.bio;
  if (data.avatarUrl !== undefined) set['avatarUrl'] = data.avatarUrl;
  if (data.username !== undefined) set['username'] = data.username;
  if (data.phone !== undefined) set['phone'] = data.phone;
  if (data.usernameChangedAt !== undefined) {
    set['usernameChangedAt'] = data.usernameChangedAt;
  }

  return User.findByIdAndUpdate(
    userId,
    { $set: set },
    { returnDocument: 'after', runValidators: true }
  )
    .select('+password')
    .exec();
};

export const updatePersonalDetails = (
  userId: string,
  data: PersonalDetailsInput
): Promise<IUserDocument | null> => {
  const set: Record<string, unknown> = {};
  if (data.dateOfBirth !== undefined) set['dateOfBirth'] = data.dateOfBirth;
  if (data.gender !== undefined) set['gender'] = data.gender;
  if (data.genderSelfDescribe !== undefined) {
    set['genderSelfDescribe'] = data.genderSelfDescribe;
  }
  if (data.pronouns !== undefined) set['pronouns'] = data.pronouns;
  if (data.relationshipStatus !== undefined) {
    set['relationshipStatus'] = data.relationshipStatus;
  }

  return User.findByIdAndUpdate(
    userId,
    { $set: set },
    { returnDocument: 'after', runValidators: true }
  )
    .select('+password')
    .exec();
};

export const updateContactLinks = (
  userId: string,
  data: ContactLinksInput
): Promise<IUserDocument | null> => {
  const set: Record<string, unknown> = {};
  if (data.website !== undefined) set['website'] = data.website;
  if (data.socialLinks !== undefined) set['socialLinks'] = data.socialLinks;

  return User.findByIdAndUpdate(
    userId,
    { $set: set },
    { returnDocument: 'after', runValidators: true }
  )
    .select('+password')
    .exec();
};

export const updateAvatarUrl = (
  userId: string,
  avatarUrl: string
): Promise<IUserDocument | null> =>
  User.findByIdAndUpdate(
    userId,
    { $set: { avatarUrl } },
    { returnDocument: 'after', runValidators: true }
  )
    .select('+password')
    .exec();

export const updateBannerUrl = (
  userId: string,
  bannerUrl: string
): Promise<IUserDocument | null> =>
  User.findByIdAndUpdate(
    userId,
    { $set: { bannerUrl } },
    { returnDocument: 'after', runValidators: true }
  )
    .select('+password')
    .exec();

export const setLastActiveAt = (
  userId: string,
  lastActiveAt: Date
): Promise<IUserDocument | null> =>
  User.findByIdAndUpdate(
    userId,
    { $set: { lastActiveAt } },
    { returnDocument: 'after' }
  ).exec();

export const appendLocationEntry = (
  userId: string,
  entry: IUserLocationEntry
): Promise<IUserDocument | null> =>
  User.findByIdAndUpdate(
    userId,
    {
      $push: {
        location: {
          $each: [entry],
          $slice: -LOCATION_TRAIL_MAX_ENTRIES,
        },
      },
    },
    { returnDocument: 'after' }
  )
    .select('+password')
    .exec();
