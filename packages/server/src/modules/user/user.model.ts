import mongoose, { Schema, type Document } from 'mongoose';
import {
  USER_ROLES,
  AUTH_PROVIDERS,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  BIO_MAX_LENGTH,
  THEMES,
  VIEW_MODES,
  type IUser,
} from '@network/shared';

export interface IUserDocument extends IUser, Document {
  password?: string;
  googleId?: string;
}

const profileViewModeSchema = new Schema(
  {
    video: { type: String, enum: VIEW_MODES },
    short: { type: String, enum: VIEW_MODES },
    post: { type: String, enum: VIEW_MODES },
  },
  { _id: false }
);

const preferencesSchema = new Schema(
  {
    theme: { type: String, enum: THEMES },
    sidebarCollapsed: { type: Boolean },
    profileViewMode: { type: profileViewModeSchema, default: undefined },
  },
  { _id: false }
);

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
    preferences: { type: preferencesSchema, default: undefined },
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
        return json;
      },
    },
  }
);

export const User = mongoose.model<IUserDocument>('User', userSchema);
