import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { SHARE_REF_TOKEN_BYTES, type ContentType } from '@network/shared';
import { ShareModel } from './share.model.js';

interface MongoDuplicateKeyError {
  code?: number;
}

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  (error as MongoDuplicateKeyError).code === 11000;

const generateRefToken = (): string =>
  crypto.randomBytes(SHARE_REF_TOKEN_BYTES).toString('base64url');

export const create = async (
  sharerId: string | null,
  contentType: ContentType,
  contentId: string
): Promise<{ ref: string }> => {
  const attempts = 3;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const ref = generateRefToken();
    try {
      await ShareModel.create({
        sharerId: sharerId ? new mongoose.Types.ObjectId(sharerId) : null,
        contentType,
        contentId: new mongoose.Types.ObjectId(contentId),
        ref,
      });
      return { ref };
    } catch (error) {
      if (isDuplicateKeyError(error) && attempt < attempts - 1) continue;
      throw error;
    }
  }

  throw new Error('Failed to generate a unique share reference token.');
};
