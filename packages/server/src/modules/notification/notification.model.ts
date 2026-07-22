import mongoose, { Schema, type Document } from 'mongoose';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TARGET_TYPES,
  PREFERENCES_NOTIFICATION_CATEGORIES,
  CONTENT_TYPES,
  type NotificationType,
  type NotificationTargetType,
  type PreferencesNotificationCategory,
  type ContentType,
} from '@network/shared';

export interface INotificationDocument extends Document {
  recipientId: mongoose.Types.ObjectId;
  type: NotificationType;
  category: PreferencesNotificationCategory;
  groupKey: string;
  targetType: NotificationTargetType;
  targetId: string | null;
  contentType: ContentType | null;
  contentId: string | null;
  topLevelCommentId: string | null;
  actorIds: mongoose.Types.ObjectId[];
  actorCount: number;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    category: {
      type: String,
      enum: PREFERENCES_NOTIFICATION_CATEGORIES,
      required: true,
    },
    groupKey: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      enum: NOTIFICATION_TARGET_TYPES,
      required: true,
    },
    targetId: {
      type: String,
      default: null,
    },
    contentType: {
      type: String,
      enum: CONTENT_TYPES,
      default: null,
    },
    contentId: {
      type: String,
      default: null,
    },
    topLevelCommentId: {
      type: String,
      default: null,
    },
    actorIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    actorCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientId: 1, updatedAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ groupKey: 1, isRead: 1 });
notificationSchema.index({ isRead: 1, readAt: 1 });

export const NotificationModel = mongoose.model<INotificationDocument>(
  'Notification',
  notificationSchema
);
