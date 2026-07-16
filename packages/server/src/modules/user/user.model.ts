import mongoose, { Schema, type Document } from 'mongoose';
import {
  USER_ROLES,
  AUTH_PROVIDERS,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  BIO_MAX_LENGTH,
  type IUser,
} from '@network/shared';
import { attachSearchTokenHooks } from '../../core/utils/attachSearchTokenHooks.js';

export interface IUserDocument extends IUser, Document {
  password?: string;
  googleId?: string;
  searchTokens: string[];
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: NAME_MAX_LENGTH,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: USERNAME_MIN_LENGTH,
      maxlength: USERNAME_MAX_LENGTH,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: EMAIL_MAX_LENGTH,
    },
    password: {
      type: String,
      select: false,
    },
    bio: {
      type: String,
      maxlength: BIO_MAX_LENGTH,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    authProviders: [
      {
        type: String,
        enum: AUTH_PROVIDERS,
        required: true,
      },
    ],
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    searchTokens: {
      type: [String],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: false,
      transform(_doc, ret) {
        const json = ret as Record<string, any>;
        json['id'] = json['_id'].toString();
        delete json['_id'];
        delete json['__v'];
        delete json['password'];
        delete json['googleId'];
        delete json['searchTokens'];
        return json;
      },
    },
  }
);

userSchema.index({ name: 'text', username: 'text' });
userSchema.index({ searchTokens: 1 });

attachSearchTokenHooks(userSchema, ['name', 'username']);

export const User = mongoose.model<IUserDocument>('User', userSchema);
