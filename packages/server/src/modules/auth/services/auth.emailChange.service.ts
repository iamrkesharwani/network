import { randomInt } from 'node:crypto';
import {
  OTP_CODE_MIN,
  OTP_CODE_MAX,
  OTP_VERIFICATION_TTL_SECONDS,
  OTP_MAX_ATTEMPTS,
  type IUser,
} from '@network/shared';
import * as authRepository from '../auth.repository.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { hashPassword, verifyPassword } from '../../../core/utils/hash.js';
import { redisClient } from '../../../core/config/redis.js';
import { revokeAllRefreshTokensForUser } from '../../../core/utils/token.js';
import { queueOtpEmail } from '../../email/email.js';
import { tryStartOtpCooldown } from '../../../core/utils/otpCooldown.js';
import { toUserResponse } from '../../../core/utils/toUserResponse.js';

interface PendingEmailChange {
  newEmail: string;
  oldOtpHash: string;
  newOtpHash: string;
}

const pendingKey = (userId: string): string => `email_change:${userId}`;
const attemptsKey = (userId: string): string =>
  `email_change_attempts:${userId}`;

export const requestEmailChange = async (
  userId: string,
  newEmail: string,
  password: string
): Promise<void> => {
  const user = await authRepository.findByIdWithPassword(userId);
  if (!user) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }
  if (!user.password) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'Add a password in Security before changing your email.'
    );
  }

  const isValidPassword = await verifyPassword(user.password, password);
  if (!isValidPassword) {
    throw new ApiError(400, 'BAD_REQUEST', 'Incorrect password');
  }

  if (newEmail.toLowerCase() === user.email.toLowerCase()) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'This is already your current email.'
    );
  }

  const existing = await authRepository.findByEmail(newEmail);
  if (existing) {
    throw new ApiError(409, 'CONFLICT', 'This email is already in use.');
  }

  const canSend = await tryStartOtpCooldown('email_change', userId);
  if (!canSend) return;

  const oldOtp = randomInt(OTP_CODE_MIN, OTP_CODE_MAX).toString();
  const newOtp = randomInt(OTP_CODE_MIN, OTP_CODE_MAX).toString();

  const pending: PendingEmailChange = {
    newEmail,
    oldOtpHash: await hashPassword(oldOtp),
    newOtpHash: await hashPassword(newOtp),
  };

  await redisClient.set(
    pendingKey(userId),
    JSON.stringify(pending),
    'EX',
    OTP_VERIFICATION_TTL_SECONDS
  );
  await redisClient.set(
    attemptsKey(userId),
    '0',
    'EX',
    OTP_VERIFICATION_TTL_SECONDS,
    'NX'
  );

  await queueOtpEmail({ to: user.email, userName: user.name, otp: oldOtp });
  await queueOtpEmail({ to: newEmail, userName: user.name, otp: newOtp });
};

export const confirmEmailChange = async (
  userId: string,
  oldEmailOtp: string,
  newEmailOtp: string
): Promise<IUser> => {
  const raw = await redisClient.get(pendingKey(userId));
  if (!raw) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'Email change request expired or not found'
    );
  }

  const attempts = parseInt(
    (await redisClient.get(attemptsKey(userId))) ?? '0',
    10
  );
  if (attempts >= OTP_MAX_ATTEMPTS) {
    await redisClient.del(pendingKey(userId));
    await redisClient.del(attemptsKey(userId));
    throw new ApiError(
      429,
      'RATE_LIMIT_EXCEEDED',
      'Too many incorrect attempts. Please start over.'
    );
  }

  const pending = JSON.parse(raw) as PendingEmailChange;

  const [isOldValid, isNewValid] = await Promise.all([
    verifyPassword(pending.oldOtpHash, oldEmailOtp),
    verifyPassword(pending.newOtpHash, newEmailOtp),
  ]);

  if (!isOldValid || !isNewValid) {
    await redisClient.incr(attemptsKey(userId));
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'One or both codes are incorrect.'
    );
  }

  let user = await authRepository.findByIdWithPassword(userId);
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found');

  user = await authRepository.updateEmail(user, pending.newEmail);

  if (user.password && user.authProviders.includes('google')) {
    user = await authRepository.unlinkOAuthProvider(user, 'google');
  }

  await revokeAllRefreshTokensForUser(userId);

  await redisClient.del(pendingKey(userId));
  await redisClient.del(attemptsKey(userId));

  return toUserResponse(user);
};
