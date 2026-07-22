import { randomInt } from 'node:crypto';
import {
  OTP_MAX_ATTEMPTS,
  OTP_CODE_MIN,
  OTP_CODE_MAX,
  OTP_VERIFICATION_TTL_SECONDS,
  KEY_OTP_VERIFIED_TTL_SECONDS,
} from '@network/shared';
import * as authRepository from '../../auth/auth.repository.js';
import { redisClient } from '../../../core/config/redis.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { hashPassword, verifyPassword } from '../../../core/utils/hash.js';
import { tryStartOtpCooldown } from '../../../core/utils/otpCooldown.js';
import { queueOtpEmail } from '../../email/email.js';

const keyOtpTokenKey = (userId: string): string => `keys_verify:${userId}`;
const keyOtpAttemptsKey = (userId: string): string => `keys_attempts:${userId}`;
const keyOtpVerifiedFlagKey = (userId: string): string =>
  `key_otp_verified:${userId}`;

export const requestKeyOtp = async (userId: string): Promise<void> => {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  const canSend = await tryStartOtpCooldown('keys', userId);
  if (!canSend) return;

  const otp = randomInt(OTP_CODE_MIN, OTP_CODE_MAX).toString();
  const hashedOtp = await hashPassword(otp);

  await redisClient.set(
    keyOtpTokenKey(userId),
    hashedOtp,
    'EX',
    OTP_VERIFICATION_TTL_SECONDS
  );
  await redisClient.set(
    keyOtpAttemptsKey(userId),
    '0',
    'EX',
    OTP_VERIFICATION_TTL_SECONDS,
    'NX'
  );

  await queueOtpEmail({ to: user.email, userName: user.name, otp });
};

export const confirmKeyOtp = async (
  userId: string,
  otp: string
): Promise<void> => {
  const tokenKey = keyOtpTokenKey(userId);
  const attemptsKey = keyOtpAttemptsKey(userId);

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
      'Too many incorrect attempts. Please request a new code.'
    );
  }

  const isValid = await verifyPassword(hashedOtp, otp);
  if (!isValid) {
    await redisClient.incr(attemptsKey);
    throw new ApiError(400, 'BAD_REQUEST', 'Incorrect code');
  }

  await redisClient.del(tokenKey);
  await redisClient.del(attemptsKey);

  await redisClient.set(
    keyOtpVerifiedFlagKey(userId),
    '1',
    'EX',
    KEY_OTP_VERIFIED_TTL_SECONDS
  );
};

export const isKeyOtpVerified = async (userId: string): Promise<boolean> =>
  Boolean(await redisClient.get(keyOtpVerifiedFlagKey(userId)));

export const consumeKeyOtpVerification = async (
  userId: string
): Promise<void> => {
  await redisClient.del(keyOtpVerifiedFlagKey(userId));
};

export const requireKeyOtpVerified = async (userId: string): Promise<void> => {
  const verified = await isKeyOtpVerified(userId);
  if (!verified) {
    throw new ApiError(
      403,
      'OTP_VERIFICATION_REQUIRED',
      'Verify your identity by email to continue.'
    );
  }
};
