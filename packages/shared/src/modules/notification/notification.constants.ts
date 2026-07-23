import { ONE_DAY_MS } from '../general/constants/time.constants.js';
import type { PreferencesNotificationCategory } from '../preferences/preferences.types.js';

export const NOTIFICATION_TYPES = [
  'follow',
  'follow_request',
  'follow_request_accepted',
  'like',
  'comment',
  'comment_reply',
  'mention',
  'jury_case_assigned',
  'content_removed',
  'report_resolved',
  'report_dismissed',
  'appeal_upheld',
  'appeal_overturned',
] as const;

export const NOTIFICATION_TARGET_TYPES = [
  'post',
  'short',
  'video',
  'comment',
  'juryCase',
  'appeal',
  'none',
] as const;

export const NOTIFICATION_TYPE_CATEGORY_MAP: Record<
  (typeof NOTIFICATION_TYPES)[number],
  PreferencesNotificationCategory
> = {
  follow: 'follows',
  follow_request: 'follows',
  follow_request_accepted: 'follows',
  like: 'likes',
  comment: 'comments',
  comment_reply: 'comments',
  mention: 'mentions',
  jury_case_assigned: 'moderation',
  content_removed: 'moderation',
  report_resolved: 'reports',
  report_dismissed: 'reports',
  appeal_upheld: 'appeals',
  appeal_overturned: 'appeals',
};

export const NOTIFICATION_GROUP_MAX_ACTORS = 5;

export const NOTIFICATION_QUEUE_NAME = 'notification';

export const NOTIFICATION_NEW_SOCKET_EVENT = 'notification:new';
export const NOTIFICATION_UNREAD_COUNT_SOCKET_EVENT =
  'notification:unread-count';

export const MENTION_MAX_PER_TEXT = 10;

export const NOTIFICATION_RETENTION_DAYS = 90;
export const NOTIFICATION_REAPER_QUEUE_NAME = 'notification-reaper';
export const NOTIFICATION_REAPER_JOB_ID = 'notification-reaper';
export const NOTIFICATION_REAPER_INTERVAL_MS = ONE_DAY_MS;

export const NOTIFICATION_COMMENT_PARAM = 'comment';
export const NOTIFICATION_THREAD_PARAM = 'thread';
