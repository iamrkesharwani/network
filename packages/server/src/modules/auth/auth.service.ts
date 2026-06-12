import { User } from '../user/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashPassword, verifyPassword } from '../../utils/hash.js';
import type { LoginInput, UserRegistrationInput } from '@network/shared';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../../utils/token.js';
import { redisClient } from '../../config/redis.js';
import { randomInt } from 'node:crypto';
import { sendOtpEmail } from '../../utils/mail.js';

export const registerLocal = async (data: UserRegistrationInput) => {
  const existingUser = await User.findOne({
    $or: [{ email: data.email }, { username: data.username }],
  });

  if (existingUser) {
    if (existingUser.email === data.email) {
      throw new ApiError(409, 'CONFLICT', 'Email is already in use');
    }
    throw new ApiError(409, 'CONFLICT', 'Username is already taken');
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await User.create({
    name: data.name,
    username: data.username,
    email: data.email,
    password: hashedPassword,
    authProviders: ['local'],
  });

  const accessToken = await generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);

  return { user, accessToken, refreshToken };
};

export const loginLocal = async (data: LoginInput) => {
  const user = await User.findOne({ email: data.email }).select('+password');

  if (!user || !user.password) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const isValidPassword = await verifyPassword(user.password, data.password);

  if (!isValidPassword) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  const accessToken = await generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);

  return { user, accessToken, refreshToken };
};

export const refreshAuthTokens = async (token: string) => {
  const [userId] = token.split('.');

  if (!userId) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid token format');
  }

  const tokenKey = `refresh_token:${userId}:${token}`;
  const isValid = await redisClient.get(tokenKey);

  if (!isValid) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired refresh token');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(401, 'UNAUTHORIZED', 'User account no longer exists');
  }

  await redisClient.del(tokenKey);

  const accessToken = await generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id);

  return { user, accessToken, refreshToken };
};

export const logoutUser = async (token: string) => {
  if (token) {
    const [userId] = token.split('.');
    if (userId) {
      await redisClient.del(`refresh_token:${userId}:${token}`);
    }
  }
};

export const sendVerificationEmail = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, 'BAD_REQUEST', 'Email is already verified');
  }

  const otp = randomInt(100000, 1000000).toString();
  const hashedOtp = await hashPassword(otp);

  const tokenKey = `email_verify:${email}`;
  await redisClient.set(tokenKey, hashedOtp, 'EX', 900);

  await sendOtpEmail(email, user.name, otp);
};

export const verifyEmailOtp = async (email: string, otp: string) => {
  const tokenKey = `email_verify:${email}`;
  const hashedOtp = await redisClient.get(tokenKey);

  if (!hashedOtp) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'Verification code expired or invalid'
    );
  }

  const isValid = await verifyPassword(hashedOtp, otp);
  if (!isValid) {
    throw new ApiError(400, 'BAD_REQUEST', 'Incorrect verification code');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  user.isEmailVerified = true;
  await user.save();
  await redisClient.del(tokenKey);
  return user;
};
