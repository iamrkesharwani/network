import { User, type IUserDocument } from '../user/user.model.js';
import type { CreateLocalUserData, UpdateOAuthData } from './auth.types.js';
import type { OAuthProvider } from '@network/shared';

const providerIdFieldMap: Record<OAuthProvider, 'googleId' | 'githubId'> = {
  google: 'googleId',
  github: 'githubId',
} as const;

export const findById = (id: string): Promise<IUserDocument | null> =>
  User.findById(id).exec();

export const findByIdWithPassword = (
  id: string
): Promise<IUserDocument | null> =>
  User.findById(id).select('+password').exec();

export const findByEmail = (email: string): Promise<IUserDocument | null> =>
  User.findOne({ email }).exec();

export const findByEmailWithPassword = (
  email: string
): Promise<IUserDocument | null> =>
  User.findOne({ email }).select('+password').exec();

export const findByEmailOrUsername = (
  email: string,
  username: string
): Promise<IUserDocument | null> =>
  User.findOne({ $or: [{ email }, { username }] }).exec();

export const findByProviderId = (
  provider: OAuthProvider,
  providerId: string
): Promise<IUserDocument | null> =>
  User.findOne({ [providerIdFieldMap[provider]]: providerId }).exec();

export const existsByUsername = (username: string): Promise<boolean> =>
  User.exists({ username }).then(Boolean);

export const createLocalUser = (
  data: CreateLocalUserData
): Promise<IUserDocument> =>
  User.create({
    name: data.name,
    username: data.username,
    email: data.email,
    password: data.password,
    authProviders: ['local'],
  });

export const createOAuthUser = (payload: {
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  provider: OAuthProvider;
  providerId: string;
}): Promise<IUserDocument> =>
  User.create({
    name: payload.name,
    username: payload.username,
    email: payload.email,
    avatarUrl: payload.avatarUrl,
    authProviders: [payload.provider],
    isEmailVerified: true,
    [providerIdFieldMap[payload.provider]]: payload.providerId,
  });

export const linkOAuthProvider = async (
  user: IUserDocument,
  provider: OAuthProvider,
  providerId: string
): Promise<IUserDocument> => {
  if (!user.authProviders.includes(provider)) {
    user.authProviders.push(provider);
  }
  (user as IUserDocument & UpdateOAuthData)[providerIdFieldMap[provider]] =
    providerId;
  return user.save();
};

export const markEmailVerified = async (
  user: IUserDocument
): Promise<IUserDocument> => {
  user.isEmailVerified = true;
  return user.save();
};

export const updatePassword = async (
  user: IUserDocument,
  hashedPassword: string
): Promise<IUserDocument> => {
  user.password = hashedPassword;
  return user.save();
};
