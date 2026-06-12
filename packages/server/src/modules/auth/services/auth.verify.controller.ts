import { User } from '../../user/user.model.js';
import { ApiError } from '../../../utils/ApiError.js';
import { hashPassword, verifyPassword } from '../../../utils/hash.js';
import { redisClient } from '../../../config/redis.js';
import { randomInt } from 'node:crypto';
import { sendOtpEmail } from '../../../utils/mail.js';
import { OTP_MAX_ATTEMPTS } from '@network/shared';

export const sendVerificationEmail = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user || user.isEmailVerified) {
    return;
  }

  const otp = randomInt(100000, 1000000).toString();
  const hashedOtp = await hashPassword(otp);

  const tokenKey = `email_verify:${email}`;
  const attemptsKey = `otp_attempts:${email}`;

  await redisClient.set(tokenKey, hashedOtp, 'EX', 900);
  await redisClient.set(attemptsKey, '0', 'EX', 900);

  await sendOtpEmail(email, user.name, otp);
};

export const verifyEmailOtp = async (email: string, otp: string) => {
  const tokenKey = `email_verify:${email}`;
  const attemptsKey = `otp_attempts:${email}`;

  const hashedOtp = await redisClient.get(tokenKey);

  if (!hashedOtp) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'Verification code expired or invalid'
    );
  }

  const attempts = parseInt((await redisClient.get(attemptsKey)) ?? '0', 10);
  if (attempts >= OTP_MAX_ATTEMPTS) {
    await redisClient.del(tokenKey);
    await redisClient.del(attemptsKey);
    throw new ApiError(
      429,
      'RATE_LIMIT_EXCEEDED',
      'Too many incorrect attempts. Please request a new verification code.'
    );
  }

  const isValid = await verifyPassword(hashedOtp, otp);
  if (!isValid) {
    await redisClient.incr(attemptsKey);
    throw new ApiError(400, 'BAD_REQUEST', 'Incorrect verification code');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  user.isEmailVerified = true;
  await user.save();
  await redisClient.del(tokenKey);
  await redisClient.del(attemptsKey);
  return user;
};
