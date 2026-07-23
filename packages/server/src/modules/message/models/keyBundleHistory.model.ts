import mongoose, { Schema, type Document, type Types } from 'mongoose';
import {
  KEY_BUNDLE_WRAPPED_PRIVATE_KEY_MAX_LENGTH,
  KEY_BUNDLE_WRAP_IV_MAX_LENGTH,
  KEY_BUNDLE_WRAP_SALT_MAX_LENGTH,
  KEY_BUNDLE_PBKDF2_MIN_ITERATIONS,
} from '@network/shared';

/**
 * A retired keypair from a past rotation - kept, not destroyed, so history
 * encrypted to it stays decryptable. Wrapped under the same account-
 * password/passphrase mechanism as the active KeyBundle (see
 * keyBundle.service.ts's password-change re-wrap cascade); deliberately has
 * no independent recovery-token wrap of its own, unlike the active bundle.
 */
export interface IKeyBundleHistoryDocument extends Document {
  userId: Types.ObjectId;
  keyVersion: number;
  wrappedPrivateKey: string;
  wrapIv: string;
  wrapSalt: string;
  pbkdf2Iterations: number;
  retiredAt: Date;
}

const keyBundleHistorySchema = new Schema<IKeyBundleHistoryDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  keyVersion: {
    type: Number,
    required: true,
  },
  wrappedPrivateKey: {
    type: String,
    required: true,
    maxlength: KEY_BUNDLE_WRAPPED_PRIVATE_KEY_MAX_LENGTH,
  },
  wrapIv: {
    type: String,
    required: true,
    maxlength: KEY_BUNDLE_WRAP_IV_MAX_LENGTH,
  },
  wrapSalt: {
    type: String,
    required: true,
    maxlength: KEY_BUNDLE_WRAP_SALT_MAX_LENGTH,
  },
  pbkdf2Iterations: {
    type: Number,
    required: true,
    min: KEY_BUNDLE_PBKDF2_MIN_ITERATIONS,
  },
  retiredAt: {
    type: Date,
    required: true,
    default: () => new Date(),
  },
});

keyBundleHistorySchema.index({ userId: 1, keyVersion: 1 }, { unique: true });

export const KeyBundleHistoryModel = mongoose.model<IKeyBundleHistoryDocument>(
  'KeyBundleHistory',
  keyBundleHistorySchema
);
