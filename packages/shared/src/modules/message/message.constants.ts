import {
  THIRTY_MINUTES_SECONDS,
  ONE_HOUR_SECONDS,
  SIX_HOURS_SECONDS,
  FIFTEEN_MINUTES_MS,
  SEVENTY_TWO_HOURS_MS,
  SEVEN_DAYS_MS,
  FIVE_MINUTES_SECONDS,
} from '../general/constants/time.constants.js';
import { OTP_MAX_ATTEMPTS } from '../auth/auth.constants.js';

export const CONVERSATION_TYPES = ['direct', 'group'] as const;

export const MESSAGE_THREAD_PAGE_LIMIT = 30;

export const MESSAGE_GROUP_MAX_PARTICIPANTS = 50;
export const GROUP_NAME_MAX_LENGTH = 100;

export const GROUP_AVATAR_ASPECT_RATIO = 1;
export const GROUP_AVATAR_WIDTH_PX = 512;
export const GROUP_AVATAR_HEIGHT_PX = 512;

export const MESSAGE_CONTENT_MAX_LENGTH = 15000;
export const MESSAGE_CIPHERTEXT_MAX_LENGTH = 21000;
export const MESSAGE_ENCRYPTED_DATA_KEY_MAX_LENGTH = 512;
export const MESSAGE_IV_MAX_LENGTH = 64;

export const MESSAGE_DEK_CACHE_TTL_SECONDS = FIVE_MINUTES_SECONDS;
export const MESSAGE_DEK_CACHE_KEY_PREFIX = 'message:dek:';

export const KEY_BUNDLE_PBKDF2_MIN_ITERATIONS = 600000;
export const KEY_BUNDLE_PUBLIC_KEY_MAX_LENGTH = 1024;
export const KEY_BUNDLE_WRAPPED_PRIVATE_KEY_MAX_LENGTH = 8192;
export const KEY_BUNDLE_WRAP_IV_MAX_LENGTH = 64;
export const KEY_BUNDLE_WRAP_SALT_MAX_LENGTH = 64;

export const KEY_OTP_VERIFIED_TTL_SECONDS = THIRTY_MINUTES_SECONDS;

export const KEY_BUNDLE_RECOVERY_TOKEN_BYTES = 32;
export const KEY_BUNDLE_RECOVERY_TOKEN_MAX_LENGTH = 128;
export const KEY_RECOVERY_MAX_ATTEMPTS = OTP_MAX_ATTEMPTS;
export const KEY_RECOVERY_ATTEMPTS_WINDOW_SECONDS = ONE_HOUR_SECONDS;

export const MESSAGE_PIN_LENGTHS = [4, 6] as const;
export const MESSAGE_PIN_NUDGE_THROTTLE_MS = SEVENTY_TWO_HOURS_MS;
export const MESSAGE_PIN_REPROMPT_MS = SEVEN_DAYS_MS;

export const MESSAGE_KEY_ROTATION_INTERVAL_MS = 90 * 24 * 60 * 60 * 1000;
export const MESSAGE_KEY_ROTATION_NUDGE_THROTTLE_MS = SEVEN_DAYS_MS;

export const MESSAGE_DELETE_SCOPES = ['me', 'everyone'] as const;

export const MESSAGE_MUTE_DURATIONS = ['8h', '1d', '1w', 'forever'] as const;

export const MESSAGE_NEW_SOCKET_EVENT = 'message:new';
export const CONVERSATION_UPDATED_SOCKET_EVENT = 'conversation:updated';
export const CONVERSATION_READ_SOCKET_EVENT = 'conversation:read';
export const MESSAGE_DELETED_SOCKET_EVENT = 'message:deleted';
export const CONVERSATION_ROOM_JOIN_EVENT = 'conversation:join';
export const CONVERSATION_ROOM_LEAVE_EVENT = 'conversation:leave';
export const MESSAGE_TYPING_SOCKET_EVENT = 'conversation:typing';
export const PRESENCE_ONLINE_SOCKET_EVENT = 'presence:online';
export const PRESENCE_OFFLINE_SOCKET_EVENT = 'presence:offline';
export const PRESENCE_REDIS_KEY_PREFIX = 'presence:online:';

export const MESSAGE_TYPING_DEBOUNCE_MS = 2000;
export const MESSAGE_TYPING_AUTO_CLEAR_MS = 3000;

export const MESSAGE_REACTION_CONTENT_MAX_LENGTH = 32;
export const MESSAGE_REACTION_CIPHERTEXT_MAX_LENGTH = 64;

export const MESSAGE_QUICK_REACTION_EMOJIS = [
  '❤️',
  '😂',
  '😮',
  '😢',
  '🙏',
  '👍',
] as const;

export const MESSAGE_REACTION_UPDATED_SOCKET_EVENT = 'message:reaction';
export const MESSAGE_EDITED_SOCKET_EVENT = 'message:edited';
export const MESSAGE_EXPIRED_SOCKET_EVENT = 'message:expired';

export const MESSAGE_EDIT_WINDOW_MS = 30 * 60 * 1000;

export const MESSAGE_DISAPPEARING_TTL_OPTIONS = ['off', '24h', '7d'] as const;

export const MESSAGE_EXPIRY_QUEUE_NAME = 'message-expiry';
export const MESSAGE_EXPIRE_JOB_NAME = 'expire-message';

export const MESSAGE_ATTACHMENT_TYPES = ['image', 'voice'] as const;
export const MESSAGE_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
export const MESSAGE_ATTACHMENT_MAX_VOICE_DURATION_MS = 5 * 60 * 1000;
export const MESSAGE_ATTACHMENT_STORAGE_KEY_MAX_LENGTH = 256;
export const MESSAGE_ATTACHMENT_UPLOAD_TTL_SECONDS = ONE_HOUR_SECONDS;

export const ALLOWED_MESSAGE_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
// video/webm is included because browser MediaRecorder audio-only recordings
// use a WebM container, and magic-byte sniffing can't distinguish an
// audio-only WebM from a video one at the container level.
export const ALLOWED_MESSAGE_VOICE_MIME_TYPES = [
  'audio/webm',
  'video/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
] as const;
export const MESSAGE_ATTACHMENT_ACCESS_URL_TTL_SECONDS = SIX_HOURS_SECONDS;

export const MESSAGE_ATTACHMENT_REAPER_QUEUE_NAME = 'message-attachment-reaper';
export const MESSAGE_ATTACHMENT_REAPER_JOB_ID = 'message-attachment-reaper';
export const MESSAGE_ATTACHMENT_REAPER_INTERVAL_MS = FIFTEEN_MINUTES_MS;

export const MESSAGE_COLD_OUTREACH_MAX_PER_HOUR = 5;
export const MESSAGE_COLD_OUTREACH_WINDOW_SECONDS = ONE_HOUR_SECONDS;

export const MESSAGE_OEMBED_PROVIDERS = [
  {
    name: 'YouTube',
    hostnames: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'],
    endpoint: 'https://www.youtube.com/oembed',
  },
  {
    name: 'X',
    hostnames: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com'],
    endpoint: 'https://publish.twitter.com/oembed',
  },
  {
    name: 'Vimeo',
    hostnames: ['vimeo.com', 'www.vimeo.com'],
    endpoint: 'https://vimeo.com/api/oembed.json',
  },
] as const;
