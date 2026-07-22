export const CONVERSATION_TYPES = ['direct', 'group'] as const;

export const MESSAGE_GROUP_MAX_PARTICIPANTS = 50;
export const GROUP_NAME_MAX_LENGTH = 100;

export const GROUP_AVATAR_ASPECT_RATIO = 1;
export const GROUP_AVATAR_WIDTH_PX = 512;
export const GROUP_AVATAR_HEIGHT_PX = 512;

export const MESSAGE_CIPHERTEXT_MAX_LENGTH = 20000;
export const MESSAGE_ENCRYPTED_KEY_MAX_LENGTH = 512;
export const MESSAGE_IV_MAX_LENGTH = 64;

export const KEY_BUNDLE_PBKDF2_MIN_ITERATIONS = 600000;
export const KEY_BUNDLE_PUBLIC_KEY_MAX_LENGTH = 1024;
export const KEY_BUNDLE_WRAPPED_PRIVATE_KEY_MAX_LENGTH = 8192;
export const KEY_BUNDLE_WRAP_IV_MAX_LENGTH = 64;
export const KEY_BUNDLE_WRAP_SALT_MAX_LENGTH = 64;

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
