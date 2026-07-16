import type {
  PaginatedResponse,
  BasicProfileInput,
  PersonalDetailsInput,
  ContactLinksInput,
} from '@network/shared';
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

export const updateBasicProfile = (
  userId: string,
  data: BasicProfileInput & { usernameChangedAt?: Date }
): Promise<IUserDocument | null> => {
  const set: Record<string, unknown> = {};
  if (data.name !== undefined) set['name'] = data.name;
  if (data.bio !== undefined) set['bio'] = data.bio;
  if (data.avatarUrl !== undefined) set['avatarUrl'] = data.avatarUrl;
  if (data.username !== undefined) set['username'] = data.username;
  if (data.usernameChangedAt !== undefined) {
    set['usernameChangedAt'] = data.usernameChangedAt;
  }

  return User.findByIdAndUpdate(
    userId,
    { $set: set },
    { returnDocument: 'after', runValidators: true }
  ).exec();
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

  return User.findByIdAndUpdate(
    userId,
    { $set: set },
    { returnDocument: 'after', runValidators: true }
  ).exec();
};

export const updateContactLinks = (
  userId: string,
  data: ContactLinksInput
): Promise<IUserDocument | null> => {
  const set: Record<string, unknown> = {};
  if (data.location !== undefined) set['location'] = data.location;
  if (data.website !== undefined) set['website'] = data.website;
  if (data.socialLinks !== undefined) set['socialLinks'] = data.socialLinks;
  if (data.phone !== undefined) set['phone'] = data.phone;

  return User.findByIdAndUpdate(
    userId,
    { $set: set },
    { returnDocument: 'after', runValidators: true }
  ).exec();
};

export const updateAvatarUrl = (
  userId: string,
  avatarUrl: string
): Promise<IUserDocument | null> =>
  User.findByIdAndUpdate(
    userId,
    { $set: { avatarUrl } },
    { returnDocument: 'after', runValidators: true }
  ).exec();
