import * as authRepository from '../auth.repository.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { hashPassword, verifyPassword } from '../../../core/utils/hash.js';
import { redisClient } from '../../../core/config/redis.js';
import { randomInt } from 'node:crypto';
import { queuePasswordResetEmail } from '../../email/email.js';
import { tryStartOtpCooldown } from '../../../core/utils/otpCooldown.js';
import {
  OTP_MAX_ATTEMPTS,
  OTP_CODE_MIN,
  OTP_CODE_MAX,
  OTP_VERIFICATION_TTL_SECONDS,
} from '@network/shared';

export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await authRepository.findByIdWithPassword(userId);

  if (!user || !user.password) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  const isValidPassword = await verifyPassword(user.password, oldPassword);

  if (!isValidPassword) {
    throw new ApiError(400, 'BAD_REQUEST', 'Incorrect current password');
  }

  await authRepository.updatePassword(user, await hashPassword(newPassword));
};

export const requestPasswordReset = async (email: string) => {
  const user = await authRepository.findByEmail(email);

  if (!user) {
    return;
  }

  const canSend = await tryStartOtpCooldown('pwd_reset', email);
  if (!canSend) {
    return;
  }

  const otp = randomInt(OTP_CODE_MIN, OTP_CODE_MAX).toString();
  const hashedOtp = await hashPassword(otp);

  const tokenKey = `pwd_reset_verify:${email}`;
  const attemptsKey = `pwd_reset_attempts:${email}`;

  await redisClient.set(tokenKey, hashedOtp, 'EX', OTP_VERIFICATION_TTL_SECONDS);
  await redisClient.set(attemptsKey, '0', 'EX', OTP_VERIFICATION_TTL_SECONDS);

  await queuePasswordResetEmail({ to: email, userName: user.name, otp });
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

  const user = await authRepository.findByEmailWithPassword(email);
  if (!user) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  await authRepository.updatePassword(user, await hashPassword(newPassword));

  await redisClient.del(tokenKey);
  await redisClient.del(attemptsKey);
};
