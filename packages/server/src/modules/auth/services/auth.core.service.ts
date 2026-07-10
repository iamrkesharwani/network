import * as authRepository from '../auth.repository.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { hashPassword, verifyPassword } from '../../../core/utils/hash.js';
import { generateUniqueUsername } from '../../../core/utils/username.js';
import {
  DUMMY_PASSWORD_HASH,
  LOGIN_LOCKOUT_MAX_ATTEMPTS,
  LOGIN_LOCKOUT_DURATION_SECONDS,
  type IUser,
  type LoginInput,
  type UserRegistrationInput,
} from '@network/shared';
import {
  generateAccessToken,
  generateRefreshToken,
  validateAndConsumeRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokensForUser,
} from '../../../core/utils/token.js';
import { redisClient } from '../../../core/config/redis.js';
import { sendVerificationEmail } from './auth.verify.service.js';

export const registerLocal = async (data: UserRegistrationInput) => {
  const existingUser = data.username
    ? await authRepository.findByEmailOrUsername(data.email, data.username)
    : await authRepository.findByEmail(data.email);

  if (existingUser) {
    throw new ApiError(
      409,
      'CONFLICT',
      'An account with this email or username already exists.'
    );
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
  const lockoutKey = `login_lockout:${data.email}`;
  const failuresKey = `login_failures:${data.email}`;

  const isLockedOut = await redisClient.get(lockoutKey);
  if (isLockedOut) {
    throw new ApiError(
      429,
      'RATE_LIMIT_EXCEEDED',
      'Too many failed login attempts. Please try again later.'
    );
  }

  const user = await authRepository.findByEmailWithPassword(data.email);
  const passwordHashToCompareAgainst = user?.password ?? DUMMY_PASSWORD_HASH;
  const isValidPassword = await verifyPassword(
    passwordHashToCompareAgainst,
    data.password
  );

  if (!user || !user.password || !isValidPassword) {
    const failures = await redisClient.incr(failuresKey);
    if (failures === 1) {
      await redisClient.expire(failuresKey, LOGIN_LOCKOUT_DURATION_SECONDS);
    }
    if (failures >= LOGIN_LOCKOUT_MAX_ATTEMPTS) {
      await redisClient.set(
        lockoutKey,
        '1',
        'EX',
        LOGIN_LOCKOUT_DURATION_SECONDS
      );
    }
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  await redisClient.del(failuresKey);

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
  const result = await validateAndConsumeRefreshToken(token);

  if (result.outcome === 'reused') {
    await revokeAllRefreshTokensForUser(result.userId);
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired refresh token');
  }

  if (result.outcome === 'invalid') {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired refresh token');
  }

  const user = await authRepository.findById(result.userId);
  if (!user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'User account no longer exists');
  }

  const accessToken = await generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);

  return { user: user.toJSON() as unknown as IUser, accessToken, refreshToken };
};

export const logoutUser = async (token: string) => {
  if (token) {
    await revokeRefreshToken(token);
  }
};
