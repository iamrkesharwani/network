import * as authRepository from '../auth.repository.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { hashPassword, verifyPassword } from '../../../core/utils/hash.js';
import { generateUniqueUsername } from '../../../core/utils/username.js';
import type { IUser, LoginInput, UserRegistrationInput } from '@network/shared';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../../core/utils/token.js';
import { redisClient } from '../../../core/config/redis.js';
import { sendVerificationEmail } from './auth.verify.service.js';

export const registerLocal = async (data: UserRegistrationInput) => {
  const existingUser = data.username
    ? await authRepository.findByEmailOrUsername(data.email, data.username)
    : await authRepository.findByEmail(data.email);

  if (existingUser) {
    if (existingUser.email === data.email) {
      throw new ApiError(409, 'CONFLICT', 'Email is already in use');
    }
    throw new ApiError(409, 'CONFLICT', 'Username is already taken');
  }

  const hashedPassword = await hashPassword(data.password);
  const username =
    data.username ??
    (await generateUniqueUsername(data.name, authRepository.existsByUsername));

  const user = await authRepository.createLocalUser({
    name: data.name,
    username,
    email: data.email,
    password: hashedPassword,
  });

  sendVerificationEmail(user.email).catch(() => {});

  return { user: user.toJSON() as unknown as IUser };
};

export const loginLocal = async (data: LoginInput) => {
  const user = await authRepository.findByEmailWithPassword(data.email);

  if (!user || !user.password) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const isValidPassword = await verifyPassword(user.password, data.password);

  if (!isValidPassword) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'Please verify your email address before logging in.'
    );
  }

  const accessToken = await generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);

  return { user: user.toJSON() as unknown as IUser, accessToken, refreshToken };
};

export const refreshAuthTokens = async (token: string) => {
  const [userId] = token.split('.');

  if (!userId || !token.includes('.')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid token format');
  }

  const tokenKey = `refresh_token:${userId}:${token}`;
  const isValid = await redisClient.get(tokenKey);

  if (!isValid) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired refresh token');
  }

  const user = await authRepository.findById(userId);
  if (!user) {
    await redisClient.del(tokenKey);
    throw new ApiError(401, 'UNAUTHORIZED', 'User account no longer exists');
  }

  const accessToken = await generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);

  await redisClient.del(tokenKey);

  return { user: user.toJSON() as unknown as IUser, accessToken, refreshToken };
};

export const logoutUser = async (token: string) => {
  if (token) {
    const [userId] = token.split('.');
    if (userId) {
      await redisClient.del(`refresh_token:${userId}:${token}`);
    }
  }
};
