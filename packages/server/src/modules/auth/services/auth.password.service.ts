import { User } from '../../user/user.model.js';
import { ApiError } from '../../../utils/ApiError.js';
import { hashPassword, verifyPassword } from '../../../utils/hash.js';
import { redisClient } from '../../../config/redis.js';
import { randomInt } from 'node:crypto';
import { sendPasswordResetEmail } from '../../../utils/mail.js';
import { OTP_MAX_ATTEMPTS } from '@network/shared';

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId).select('+password');

  if (!user || !user.password) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  const isValidPassword = await verifyPassword(user.password, oldPassword);

  if (!isValidPassword) {
    throw new ApiError(400, 'BAD_REQUEST', 'Incorrect current password');
  }

  user.password = await hashPassword(newPassword);
  await user.save();
};

export const requestPasswordReset = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    return;
  }

  const otp = randomInt(100000, 1000000).toString();
  const hashedOtp = await hashPassword(otp);

  const tokenKey = `pwd_reset_verify:${email}`;
  const attemptsKey = `pwd_reset_attempts:${email}`;

  await redisClient.set(tokenKey, hashedOtp, 'EX', 900);
  await redisClient.set(attemptsKey, '0', 'EX', 900);

  await sendPasswordResetEmail(email, user.name, otp);
};

export const completePasswordReset = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  const tokenKey = `pwd_reset_verify:${email}`;
  const attemptsKey = `pwd_reset_attempts:${email}`;

  const hashedOtp = await redisClient.get(tokenKey);

  if (!hashedOtp) {
    throw new ApiError(400, 'BAD_REQUEST', 'Reset code expired or invalid');
  }

  const attempts = parseInt((await redisClient.get(attemptsKey)) ?? '0', 10);
  if (attempts >= OTP_MAX_ATTEMPTS) {
    await redisClient.del(tokenKey);
    await redisClient.del(attemptsKey);
    throw new ApiError(
      429,
      'RATE_LIMIT_EXCEEDED',
      'Too many incorrect attempts. Please request a new reset code.'
    );
  }

  const isValid = await verifyPassword(hashedOtp, otp);
  if (!isValid) {
    await redisClient.incr(attemptsKey);
    throw new ApiError(400, 'BAD_REQUEST', 'Incorrect reset code');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  await redisClient.del(tokenKey);
  await redisClient.del(attemptsKey);
};
