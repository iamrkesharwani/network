import type {
  IKeyBundleOwnResponse,
  IKeyBundlePublicResponse,
  KeyBundlePublishInput,
} from '@network/shared';
import * as keyBundleRepository from '../repository/keyBundle.repository.js';
import { ApiError } from '../../../core/utils/ApiError.js';
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
  const doc = await keyBundleRepository.upsertKeyBundle(userId, data);
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
