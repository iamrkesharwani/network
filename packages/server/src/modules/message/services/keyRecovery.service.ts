import type { IKeyBundleRecoveryResponse } from '@network/shared';
import {
  KEY_RECOVERY_MAX_ATTEMPTS,
  KEY_RECOVERY_ATTEMPTS_WINDOW_SECONDS,
} from '@network/shared';
import * as keyBundleRepository from '../repository/keyBundle.repository.js';
import * as keyOtpService from './keyOtp.service.js';
import { redisClient } from '../../../core/config/redis.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { verifyPassword } from '../../../core/utils/hash.js';

const keyRecoveryAttemptsKey = (userId: string): string =>
  `key_recovery_attempts:${userId}`;

export const confirmKeyRecovery = async (
  userId: string,
  recoveryToken: string
): Promise<IKeyBundleRecoveryResponse> => {
  await keyOtpService.requireKeyOtpVerified(userId);

  const attemptsKey = keyRecoveryAttemptsKey(userId);
  const attempts = parseInt((await redisClient.get(attemptsKey)) ?? '0', 10);
  if (attempts >= KEY_RECOVERY_MAX_ATTEMPTS) {
    throw new ApiError(
      429,
      'RATE_LIMIT_EXCEEDED',
      'Too many incorrect attempts. Please try again later.'
    );
  }

  const doc = await keyBundleRepository.findByUserIdWithRecoveryHash(userId);
  if (
    !doc ||
    !doc.recoveryTokenHash ||
    !doc.recoveryWrappedPrivateKey ||
    !doc.recoveryWrapIv ||
    !doc.recoveryWrapSalt ||
    !doc.recoveryPbkdf2Iterations
  ) {
    throw new ApiError(
      404,
      'NOT_FOUND',
      'Recovery is not available for this account.'
    );
  }

  const isValid = await verifyPassword(doc.recoveryTokenHash, recoveryToken);
  if (!isValid) {
    await redisClient.set(
      attemptsKey,
      (attempts + 1).toString(),
      'EX',
      KEY_RECOVERY_ATTEMPTS_WINDOW_SECONDS
    );
    throw new ApiError(400, 'BAD_REQUEST', 'Incorrect recovery code');
  }

  await redisClient.del(attemptsKey);
  await keyOtpService.consumeKeyOtpVerification(userId);

  return {
    recoveryWrappedPrivateKey: doc.recoveryWrappedPrivateKey,
    recoveryWrapIv: doc.recoveryWrapIv,
    recoveryWrapSalt: doc.recoveryWrapSalt,
    recoveryPbkdf2Iterations: doc.recoveryPbkdf2Iterations,
  };
};
