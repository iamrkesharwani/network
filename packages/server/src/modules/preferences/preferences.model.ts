import mongoose, { Schema, type Document, type Types } from 'mongoose';
import {
  THEMES,
  VIEW_MODES,
  PROFILE_CONTENT_TYPES,
  CAPTION_LANGUAGE_CODES,
  PREFERENCES_NOTIFICATION_CATEGORIES,
  PREFERENCES_DEFAULT_VOLUME,
  PREFERENCES_DEFAULT_PLAYBACK_RATE,
} from '@network/shared';

export interface IPreferencesDocument extends Document {
  userId: Types.ObjectId;
  version: number;
  appearance: {
    theme?: string;
    sidebarCollapsed?: boolean;
  };
  layout: {
    profileViewMode?: Record<string, string>;
  };
  playback: {
    volume: number;
    muted?: boolean;
    playbackRate: number;
    autoplayNext?: boolean;
    captionsDefaultOn?: boolean;
    captionsLanguage?: string;
  };
  notifications: {
    push?: Record<string, boolean>;
    email?: Record<string, boolean>;
  };
  updatedAt: Date;
  createdAt: Date;
}

const profileViewModeSchema = new Schema(
  Object.fromEntries(
    PROFILE_CONTENT_TYPES.map((contentType) => [
      contentType,
      { type: String, enum: VIEW_MODES },
    ])
  ),
  { _id: false }
);

const appearanceSchema = new Schema(
  {
    theme: { type: String, enum: THEMES },
    sidebarCollapsed: { type: Boolean },
  },
  { _id: false }
);

const layoutSchema = new Schema(
  {
    profileViewMode: { type: profileViewModeSchema, default: undefined },
  },
  { _id: false }
);

const playbackSchema = new Schema(
  {
    volume: { type: Number, min: 0, max: 1, default: PREFERENCES_DEFAULT_VOLUME },
    muted: { type: Boolean },
    playbackRate: { type: Number, default: PREFERENCES_DEFAULT_PLAYBACK_RATE },
    autoplayNext: { type: Boolean },
    captionsDefaultOn: { type: Boolean },
    captionsLanguage: { type: String, enum: CAPTION_LANGUAGE_CODES },
  },
  { _id: false }
);

const notificationChannelSchema = new Schema(
  Object.fromEntries(
    PREFERENCES_NOTIFICATION_CATEGORIES.map((category) => [
      category,
      { type: Boolean },
    ])
  ),
  { _id: false }
);

const notificationsSchema = new Schema(
  {
    push: { type: notificationChannelSchema, default: undefined },
    email: { type: notificationChannelSchema, default: undefined },
  },
  { _id: false }
);

const preferencesSchema = new Schema<IPreferencesDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    version: { type: Number, default: 1 },
    appearance: { type: appearanceSchema, default: () => ({}) },
    layout: { type: layoutSchema, default: () => ({}) },
    playback: { type: playbackSchema, default: () => ({}) },
    notifications: { type: notificationsSchema, default: () => ({}) },
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
        return json;
      },
    },
  }
);

export const Preferences = mongoose.model<IPreferencesDocument>(
  'Preferences',
  preferencesSchema
);
