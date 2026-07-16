import mongoose, { Schema, type Document } from 'mongoose';
import {
  USER_ROLES,
  AUTH_PROVIDERS,
  GENDER_OPTIONS,
  USER_STATUSES,
  DEFAULT_USER_STATUS,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  BIO_MAX_LENGTH,
  GENDER_SELF_DESCRIBE_MAX_LENGTH,
  PRONOUNS_MAX_LENGTH,
  LOCATION_MAX_LENGTH,
  WEBSITE_MAX_LENGTH,
  PHONE_MAX_LENGTH,
  SOCIAL_LINKS_MAX,
  SOCIAL_LINK_PLATFORM_MAX_LENGTH,
  type IUser,
} from '@network/shared';
import { attachSearchTokenHooks } from '../../core/utils/attachSearchTokenHooks.js';

export interface IUserDocument extends IUser, Document {
  password?: string;
  googleId?: string;
  searchTokens: string[];
}

const socialLinkSchema = new Schema(
  {
    platform: { type: String, maxlength: SOCIAL_LINK_PLATFORM_MAX_LENGTH },
    url: { type: String },
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
    usernameChangedAt: {
      type: Date,
      default: null,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: GENDER_OPTIONS,
    },
    genderSelfDescribe: {
      type: String,
      trim: true,
      maxlength: GENDER_SELF_DESCRIBE_MAX_LENGTH,
    },
    pronouns: {
      type: String,
      trim: true,
      maxlength: PRONOUNS_MAX_LENGTH,
    },
    location: {
      type: String,
      trim: true,
      maxlength: LOCATION_MAX_LENGTH,
    },
    website: {
      type: String,
      trim: true,
      maxlength: WEBSITE_MAX_LENGTH,
    },
    socialLinks: {
      type: [socialLinkSchema],
      default: undefined,
      validate: {
        validator: (links: unknown[]) => links.length <= SOCIAL_LINKS_MAX,
        message: `Cannot have more than ${SOCIAL_LINKS_MAX} social links.`,
      },
    },
    phone: {
      type: String,
      trim: true,
      maxlength: PHONE_MAX_LENGTH,
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: DEFAULT_USER_STATUS,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
    reactivateAt: {
      type: Date,
      default: null,
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
