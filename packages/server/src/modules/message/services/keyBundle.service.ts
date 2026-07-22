import type {
  IKeyBundleOwnResponse,
  IKeyBundlePublicResponse,
  KeyBundlePublishInput,
} from '@network/shared';
import * as keyBundleRepository from '../repository/keyBundle.repository.js';
import * as keyOtpService from './keyOtp.service.js';
import * as authRepository from '../../auth/auth.repository.js';
import { ApiError } from '../../../core/utils/ApiError.js';
import { hashPassword } from '../../../core/utils/hash.js';
import { queueKeyRecoveryEmail } from '../../email/email.js';
import type { IKeyBundleDocument } from '../models/keyBundle.model.js';

const toOwnResponse = (doc: IKeyBundleDocument): IKeyBundleOwnResponse => ({
  publicKey: doc.publicKey,
  wrappedPrivateKey: doc.wrappedPrivateKey,
  wrapIv: doc.wrapIv,
  wrapSalt: doc.wrapSalt,
  pbkdf2Iterations: doc.pbkdf2Iterations,
  keyVersion: doc.keyVersion,
});

const toPublicResponse = (
  doc: IKeyBundleDocument
): IKeyBundlePublicResponse => ({
  userId: doc.userId.toString(),
  publicKey: doc.publicKey,
  keyVersion: doc.keyVersion,
});

export const publishKeyBundle = async (
  userId: string,
  data: KeyBundlePublishInput
): Promise<IKeyBundleOwnResponse> => {
  const existing = await keyBundleRepository.findByUserId(userId);
  const isReset = existing ? existing.publicKey !== data.publicKey : false;

  if (isReset) {
    await keyOtpService.requireKeyOtpVerified(userId);
  }

  const recoveryTokenHash = data.recoveryToken
    ? await hashPassword(data.recoveryToken)
    : undefined;

  const doc = await keyBundleRepository.upsertKeyBundle(
    userId,
    data,
    recoveryTokenHash
  );

  if (isReset) {
    await keyOtpService.consumeKeyOtpVerification(userId);
  }

  if (data.recoveryToken) {
    const user = await authRepository.findById(userId);
    if (user) {
      await queueKeyRecoveryEmail({
        to: user.email,
        userName: user.name,
        recoveryToken: data.recoveryToken,
      });
    }
  }

  return toOwnResponse(doc);
};

export const getOwnKeyBundle = async (
  userId: string
): Promise<IKeyBundleOwnResponse> => {
  const doc = await keyBundleRepository.findByUserId(userId);
  if (!doc) {
    throw new ApiError(
      404,
      'NOT_FOUND',
      'No messaging key found for this account.'
    );
  }

  await keyOtpService.requireKeyOtpVerified(userId);

  return toOwnResponse(doc);
};

export const getPublicKey = async (
  userId: string
): Promise<IKeyBundlePublicResponse> => {
  const doc = await keyBundleRepository.findByUserId(userId);
  if (!doc) {
    throw new ApiError(
      404,
      'NOT_FOUND',
      'This user has not set up messaging yet.'
    );
  }
  return toPublicResponse(doc);
};

export const getPublicKeys = async (
  userIds: string[]
): Promise<IKeyBundlePublicResponse[]> => {
  const docs = await keyBundleRepository.findPublicByUserIds(userIds);
  return docs.map(toPublicResponse);
};

export const assertAllHaveKeyBundle = async (
  userIds: string[]
): Promise<void> => {
  const uniqueIds = Array.from(new Set(userIds));
  const withBundle = await keyBundleRepository.findUserIdsWithKeyBundle(
    uniqueIds
  );
  const withBundleSet = new Set(withBundle);
  const missing = uniqueIds.filter((id) => !withBundleSet.has(id));

  if (missing.length > 0) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'One or more participants have not set up messaging yet.'
    );
  }
};
