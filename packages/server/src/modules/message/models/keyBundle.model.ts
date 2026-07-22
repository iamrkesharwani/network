import mongoose, { Schema, type Document, type Types } from 'mongoose';
import {
  KEY_BUNDLE_PUBLIC_KEY_MAX_LENGTH,
  KEY_BUNDLE_WRAPPED_PRIVATE_KEY_MAX_LENGTH,
  KEY_BUNDLE_WRAP_IV_MAX_LENGTH,
  KEY_BUNDLE_WRAP_SALT_MAX_LENGTH,
  KEY_BUNDLE_PBKDF2_MIN_ITERATIONS,
} from '@network/shared';

export interface IKeyBundleDocument extends Document {
  userId: Types.ObjectId;
  publicKey: string;
  wrappedPrivateKey: string;
  wrapIv: string;
  wrapSalt: string;
  pbkdf2Iterations: number;
  keyVersion: number;
  recoveryWrappedPrivateKey?: string;
  recoveryWrapIv?: string;
  recoveryWrapSalt?: string;
  recoveryPbkdf2Iterations?: number;
  recoveryTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const keyBundleSchema = new Schema<IKeyBundleDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    publicKey: {
      type: String,
      required: true,
      maxlength: KEY_BUNDLE_PUBLIC_KEY_MAX_LENGTH,
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
    keyVersion: {
      type: Number,
      default: 0,
    },
    recoveryWrappedPrivateKey: {
      type: String,
      maxlength: KEY_BUNDLE_WRAPPED_PRIVATE_KEY_MAX_LENGTH,
    },
    recoveryWrapIv: {
      type: String,
      maxlength: KEY_BUNDLE_WRAP_IV_MAX_LENGTH,
    },
    recoveryWrapSalt: {
      type: String,
      maxlength: KEY_BUNDLE_WRAP_SALT_MAX_LENGTH,
    },
    recoveryPbkdf2Iterations: {
      type: Number,
      min: KEY_BUNDLE_PBKDF2_MIN_ITERATIONS,
    },
    recoveryTokenHash: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const KeyBundleModel = mongoose.model<IKeyBundleDocument>(
  'KeyBundle',
  keyBundleSchema
);
