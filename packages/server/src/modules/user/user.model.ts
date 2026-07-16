import mongoose, { Schema, type Document } from 'mongoose';
import {
  USER_ROLES,
  AUTH_PROVIDERS,
  GENDER_OPTIONS,
  RELATIONSHIP_STATUSES,
  USER_STATUSES,
  DEFAULT_USER_STATUS,
  SOCIAL_PLATFORMS,
  LOCATION_TRAIL_MAX_ENTRIES,
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  BIO_MAX_LENGTH,
  GENDER_SELF_DESCRIBE_MAX_LENGTH,
  PRONOUN_MAX_LENGTH,
  PRONOUNS_MAX_COUNT,
  WEBSITE_MAX_LENGTH,
  PHONE_NUMBER_MAX_LENGTH,
  SOCIAL_LINKS_MAX,
  SOCIAL_LINK_PLATFORM_MAX_LENGTH,
  type IUser,
} from '@network/shared';
import { attachSearchTokenHooks } from '../../core/utils/attachSearchTokenHooks.js';

export interface IUserDocument extends IUser, Document {
  password?: string | undefined;
  googleId?: string | undefined;
  searchTokens: string[];
}

const socialLinkSchema = new Schema(
  {
    platform: { type: String, enum: SOCIAL_PLATFORMS },
    url: { type: String },
    customLabel: { type: String, maxlength: SOCIAL_LINK_PLATFORM_MAX_LENGTH },
  },
  { _id: false }
);

const phoneSchema = new Schema(
  {
    dialCode: { type: String },
    iso2: { type: String },
    number: { type: String, maxlength: PHONE_NUMBER_MAX_LENGTH },
  },
  { _id: false }
);

const locationEntrySchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    capturedAt: { type: Date, required: true },
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
      type: [String],
      default: undefined,
      validate: {
        validator: (entries: string[]) =>
          entries.length <= PRONOUNS_MAX_COUNT &&
          entries.every((entry) => entry.length <= PRONOUN_MAX_LENGTH),
        message: `Cannot exceed ${PRONOUNS_MAX_COUNT} pronouns of ${PRONOUN_MAX_LENGTH} characters each.`,
      },
    },
    relationshipStatus: {
      type: String,
      enum: RELATIONSHIP_STATUSES,
    },
    location: {
      type: [locationEntrySchema],
      default: undefined,
      validate: {
        validator: (entries: unknown[]) =>
          entries.length <= LOCATION_TRAIL_MAX_ENTRIES,
        message: `Cannot exceed ${LOCATION_TRAIL_MAX_ENTRIES} location entries.`,
      },
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
      type: phoneSchema,
      default: undefined,
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
    deletionRequestedAt: {
      type: Date,
      default: null,
    },
    deletionScheduledAt: {
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
